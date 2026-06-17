type ContentSection = {
  title: string;
  content: string;
};

type ParsedContent = string | { sections: ContentSection[] } | undefined;

export const parseModuleContent = (raw: string | undefined): ParsedContent => {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};
