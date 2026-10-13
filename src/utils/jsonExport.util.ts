export const stringifyJson = (value: unknown) => JSON.stringify(value, null, 2);

export const copyJson = (value: unknown) =>
  navigator.clipboard.writeText(stringifyJson(value));

export const downloadJson = (value: unknown, filename: string) => {
  const blob = new Blob([stringifyJson(value)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
