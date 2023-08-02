export function createLog(context) {
  return (message, ...optionalParams) => {
    console.log(`[${context}]`, message, ...optionalParams);
  };
}
