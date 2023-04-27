import * as Papa from "papaparse";

type TableRow = { [key: string]: string };

export function csvToHtmlTable(csvString: string): string {
  const parsedData = Papa.parse<TableRow>(csvString, { header: true });
  const headers = parsedData.meta.fields;

  if (!headers) {
    throw new Error("CSV does not have headers");
  }

  const rows = parsedData.data;

  let table = "<table><thead><tr>";
  for (const header of headers) {
    table += `<th>${header}</th>`;
  }
  table += "</tr></thead><tbody>";

  for (const row of rows) {
    table += "<tr>";
    for (const header of headers) {
      table += `<td>${row[header]}</td>`;
    }
    table += "</tr>";
  }

  table += "</tbody></table>";
  return table;
}

const csvString = "header1,header2\r\nvalue1,value2";
const htmlTable = csvToHtmlTable(csvString);
console.log(htmlTable);
