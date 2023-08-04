// Copyright (c) 2023 Marco Trulla <marco.trulla+dev@gmail.com>
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export function createLog(context) {
  return (message, ...optionalParams) => {
    console.log(`[${context}]`, message, ...optionalParams);
  };
}
