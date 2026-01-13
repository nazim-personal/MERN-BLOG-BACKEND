export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const generateUniqueSlug = async (
  title: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> => {
  let slug = generateSlug(title);
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${generateSlug(title)}-${counter}`;
    counter++;
  }

  return slug;
};
