import os
import re
import unicodedata
import pandas as pd


MONTH_MAP = {
    "JAN": 1, "FEB": 2, "MAR": 3, "APR": 4, "MAY": 5, "JUN": 6,
    "JUL": 7, "AUG": 8, "SEP": 9, "OCT": 10, "NOV": 11, "DEC": 12,
    "JANUARY": 1, "FEBRUARY": 2, "MARCH": 3, "APRIL": 4, "JUNE": 6,
    "JULY": 7, "AUGUST": 8, "SEPTEMBER": 9, "OCTOBER": 10, "NOVEMBER": 11, "DECEMBER": 12
}


def normalize_text(x: str) -> str:
    x = unicodedata.normalize("NFKD", str(x))
    x = x.encode("ascii", "ignore").decode("ascii")
    x = re.sub(r"\s+", " ", x)
    x = re.sub(r"[^A-Za-z0-9 &(),.\-]", "", x)  # keep common punctuation
    return x.strip()


def normalize_country(name) -> str:
    if pd.isna(name):
        return ""

    name = normalize_text(name).upper()

    # remove useless punctuation patterns/spaces
    name = name.replace(" ,", ",").replace("  ", " ").strip()

    # Known country variations / historical labels
    fixes = {
        "ZAMBIA(NORTHERN RHODESIA)": "ZAMBIA",
        "ZAMBIA (NORTHERN RHODESIA)": "ZAMBIA",
        "BOSNIA & HERZEGOVINA": "BOSNIA AND HERZEGOVINA",
        "SAINT VINCENT THE GRENADI": "SAINT VINCENT AND THE GRENADINES",
        "SOUTH AFRICA-ZUID AFRIKA": "SOUTH AFRICA",
        "LIBYA(LIBYAN ARAB JAMAHIR)": "LIBYA",
        "SLOVAKIA(SLOVAK REPUBLIC)": "SLOVAKIA",
        "YEMEN (YEMEN ARAB REPUBLIC)": "YEMEN",
        "CONGO, REPUBLIC OF.": "CONGO",
        "CONGO, REPUBLIC OF": "CONGO",
        "CONGO, THE DEMOCRATIC REPUBLIC": "CONGO",
        "CONGO, THE DEMOCRATIC REPUBLIC OF": "CONGO",
    }

    return fixes.get(name, name)


def looks_like_number(x) -> bool:
    try:
        float(str(x).replace(",", ""))
        return True
    except Exception:
        return False


def clean_country_monthly_data(file_path: str) -> pd.DataFrame:
    df = pd.read_excel(file_path, header=None)

    # ----- Find header rows (where the real table starts) -----
    header_rows = []
    for i in range(len(df)):
        # Robust: df cells may be float/NaN/etc. Ensure strings before .upper()
        raw_vals = df.iloc[i].tolist()
        row = ["" if pd.isna(v) else str(v).strip() for v in raw_vals]
        row_upper = [v.upper() for v in row]

        # Must contain "COUNTRY" and at least 6 month names to be considered a real header
        month_hits = sum(1 for r in row_upper if r in MONTH_MAP)
        if "COUNTRY" in row_upper and month_hits >= 6:
            header_rows.append(i)

    all_records = []

    for idx, header_idx in enumerate(header_rows):
        # ----- Detect year by scanning upwards -----
        year = None
        for back in range(1, 45):
            if header_idx - back < 0:
                break
            text = str(df.iloc[header_idx - back, 0])
            m = re.search(r"\b(20\d{2})\b", text)
            if m:
                year = int(m.group(1))
                break
        if year is None:
            continue

        # ----- block end -----
        end_idx = header_rows[idx + 1] if idx < len(header_rows) - 1 else len(df)

        block = df.iloc[header_idx:end_idx].copy()
        if block.empty:
            continue

        # set columns using header row
        block.columns = block.iloc[0].astype(str).str.strip()
        block = block.iloc[1:].copy()

        # Identify month columns (robust)
        cols_upper = {c: str(c).strip().upper() for c in block.columns}
        month_cols = [c for c, cu in cols_upper.items() if cu in MONTH_MAP]

        if len(month_cols) < 6:
            continue

        # Everything else before/including "Country" area = country-text columns
        # Some sheets have Rank/No + Country + extra column that continues country name
        non_month_cols = [c for c in block.columns if c not in month_cols]

        # Convert month columns to numeric
        for mc in month_cols:
            block[mc] = (
                block[mc]
                .astype(str)
                .str.replace(",", "", regex=False)
                .str.strip()
            )
            block[mc] = pd.to_numeric(block[mc], errors="coerce")

        # ----- Handle split country names using a "pending prefix" -----
        pending_prefix = ""

        for _, r in block.iterrows():
            # Build country name from ALL non-month columns (important fix)
            parts = []
            for c in non_month_cols:
                val = r.get(c)
                if pd.isna(val):
                    continue
                s = normalize_text(val)
                if not s:
                    continue

                # ignore pure numbers (rank/no)
                if looks_like_number(s):
                    continue

                parts.append(s)

            country_raw = " ".join(parts).strip()

            # Skip obvious totals/empty
            if country_raw.upper().startswith("TOTAL") or country_raw.upper() in {"", "NAN"}:
                pending_prefix = ""
                continue

            # If the row has NO month values => it's likely a continuation row like "REPUBLIC"
            has_any_month = any(pd.notna(r.get(mc)) for mc in month_cols)

            if not has_any_month:
                # store continuation prefix
                if country_raw:
                    pending_prefix = (pending_prefix + " " + country_raw).strip() if pending_prefix else country_raw
                continue

            # If we have a pending prefix, combine it
            if pending_prefix:
                country_raw = (pending_prefix + " " + country_raw).strip()
                pending_prefix = ""

            country = normalize_country(country_raw)

            # Some bad split artifacts produce single word like "REPUBLIC" => skip them safely
            if country in {"REPUBLIC"}:
                continue

            for mc in month_cols:
                arrivals = r.get(mc)
                if pd.isna(arrivals):
                    continue

                all_records.append({
                    "year": year,
                    "month": MONTH_MAP[str(mc).strip().upper()],
                    "country": country,
                    "arrivals": float(arrivals)
                })

    final_df = pd.DataFrame(all_records)
    if final_df.empty:
        raise ValueError("No data extracted. Check Excel structure / header detection.")

    # ----- Collapse duplicates (same country-year-month) by SUM (safe) -----
    final_df = (
        final_df.groupby(["country", "year", "month"], as_index=False)
                .agg({"arrivals": "sum"})
    )

    # Date column
    final_df["date"] = pd.to_datetime(
        final_df["year"].astype(str) + "-" + final_df["month"].astype(str) + "-01",
        errors="raise"
    )

    final_df = final_df.sort_values(["country", "date"])[["date", "year", "month", "country", "arrivals"]]

    # ----- Hard guarantee: NO duplicates remain -----
    dup_count = final_df.duplicated(["country", "year", "month"]).sum()
    if dup_count != 0:
        raise ValueError(f"Still has {dup_count} duplicate (country,year,month) rows after grouping. Need more fixes.")

    return final_df


def save_processed_data(df: pd.DataFrame, output_path: str):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    try:
        df.to_csv(output_path, index=False)
    except PermissionError:
        raise PermissionError(
            f"Permission denied writing '{output_path}'. "
            f"Close Excel / close the CSV if it's open, then run again."
        )


if __name__ == "__main__":
    raw_path = os.path.join("data", "raw.xlsx")
    output_path = os.path.join("data", "processed.csv")

    clean_df = clean_country_monthly_data(raw_path)
    save_processed_data(clean_df, output_path)

    print("Processed dataset saved at:")
    print(os.path.abspath(output_path))

    # Quick sanity checks
    print("Years:", sorted(clean_df["year"].unique()))
    print("Duplicates:", clean_df.duplicated(["country", "year", "month"]).sum())