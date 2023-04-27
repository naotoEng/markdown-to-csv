export class MarkdownToCSV {
  private testItems: {
    id: number;
    main: string;
    sub: string;
    testName: string;
    testDetails: string;
    expectedResult: string;
  }[] = [];
  private testTitle: string[] = [];
  private main: string[] = [];
  private sub: string[] = [];
  private testDetails: string[] = [];

  private newline = "\n";

  constructor(newline?: string) {
    if (newline) {
      this.newline = newline;
    }
  }

  parse(input: string): string {
    const lines = input.split(this.newline);
    let id = 1;
    let state = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      switch (true) {
        case line.startsWith("# "):
          this.testTitle = [line.substring(2).trim()];
          this.main = [];
          this.sub = [];
          state = "testTitle";
          break;
        case line.startsWith("## "):
          this.main = [line.substring(3).trim()];
          state = "main";
          break;
        case line.startsWith("### "):
          this.sub = [line.substring(4).trim()];
          state = "sub";
          break;
        case line.startsWith("- [ ] ") || line.startsWith("- [x] "):
          if (state === "testDetails") {
            this.testItems.push({
              id: id++,
              main: this.main.join(this.newline),
              sub: this.sub.join(this.newline),
              testName: this.testTitle.join(this.newline),
              testDetails: this.testDetails.join(this.newline),
              expectedResult: line.substring(6).trim(),
            });
            break;
          }
        case line.startsWith("- "):
          if (
            (state === "sub" || state === "testDetails") &&
            !lines[i].startsWith(" ")
          ) {
            this.testDetails = [line.substring(2).trim()];
            state = "testDetails";
          } else {
            this.pushDataByState(line.substring(2).trim(), state);
          }
          break;
        default:
          if (line.length > 0) this.pushDataByState(line, state);
      }
    }
    return this.generateCSV();
  }

  private pushDataByState(data: string, state: string) {
    switch (state) {
      case "testTitle":
        this.testTitle.push(data);
        break;
      case "main":
        this.main.push(data);
        break;
      case "sub":
        this.sub.push(data);
        break;
      case "testDetails":
        this.testDetails.push(data);
        break;
      default:
    }
  }

  private generateCSV(): string {
    const header = "id,main,sub,testName,testDetails,expectedResult";
    const rows = this.testItems.map((item) => {
      return `${item.id},"${item.main.replace(/"/g, '""')}","${item.sub.replace(
        /"/g,
        '""'
      )}","${item.testName.replace(/"/g, '""')}","${item.testDetails.replace(
        /"/g,
        '""'
      )}","${item.expectedResult.replace(/"/g, '""')}"`;
    });
    return header + this.newline + rows.join(this.newline);
  }
}
