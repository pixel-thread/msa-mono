import { useState, useCallback } from 'react';
import Papa from 'papaparse';

interface CsvPreviewState {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  fileName: string;
  fileSize: number;
}

interface UseCsvPreviewReturn {
  preview: CsvPreviewState | null;
  parseFile: (file: File) => void;
  error: string | null;
  clear: () => void;
  isParsing: boolean;
}

export function useCsvPreview(): UseCsvPreviewReturn {
  const [preview, setPreview] = useState<CsvPreviewState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const parseFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv') && !file.type.includes('csv')) {
      setError('Please select a valid CSV file');
      return;
    }

    setIsParsing(true);
    setError(null);
    setPreview(null);

    Papa.parse<string[]>(file, {
      header: false,
      preview: 1,
      complete(results) {
        if (!results.data || results.data.length === 0) {
          setError('CSV file appears to be empty');
          setIsParsing(false);
          return;
        }
        const headers = results.data[0] as string[];

        Papa.parse<Record<string, string>>(file, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
          complete(parseResult) {
            const rows = parseResult.data.filter(
              (row) => Object.values(row).some((val) => val !== null && val !== ''),
            );

            setPreview({
              headers,
              rows,
              totalRows: rows.length,
              fileName: file.name,
              fileSize: file.size,
            });
            setIsParsing(false);
          },
          error(parseError) {
            setError(parseError.message || 'Failed to parse CSV file');
            setIsParsing(false);
          },
        });
      },
      error(err) {
        setError(err.message || 'Failed to read CSV file');
        setIsParsing(false);
      },
    });
  }, []);

  const clear = useCallback(() => {
    setPreview(null);
    setError(null);
    setIsParsing(false);
  }, []);

  return { preview, parseFile, error, clear, isParsing };
}
