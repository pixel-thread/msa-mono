import { useCallback, useEffect, useRef, useState } from 'react';
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
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const safeSetState = useCallback((updater: () => void) => {
    if (mountedRef.current) {
      updater();
    }
  }, []);

  const parseFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.csv') && !file.type.includes('csv')) {
        setError('Please select a valid CSV file');
        return;
      }

      setIsParsing(true);
      setError(null);
      setPreview(null);

      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        complete(parseResult) {
          const headers = parseResult.meta.fields ?? [];
          const rows = parseResult.data.filter((row) =>
            Object.values(row).some((val) => val !== null && val !== ''),
          );

          safeSetState(() => {
            if (rows.length === 0 && headers.length === 0) {
              setError('CSV file appears to be empty');
            } else {
              setPreview({
                headers,
                rows,
                totalRows: rows.length,
                fileName: file.name,
                fileSize: file.size,
              });
            }
            setIsParsing(false);
          });
        },
        error(parseError) {
          safeSetState(() => {
            setError(parseError.message || 'Failed to parse CSV file');
            setIsParsing(false);
          });
        },
      });
    },
    [safeSetState],
  );

  const clear = useCallback(() => {
    setPreview(null);
    setError(null);
    setIsParsing(false);
  }, []);

  return { preview, parseFile, error, clear, isParsing };
}
