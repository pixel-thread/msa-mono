/** Error record for a single CSV row that failed validation or import during bulk user import. */
export type CsvImportError = {
  row: number;
  email: string;
  reason: string;
};
