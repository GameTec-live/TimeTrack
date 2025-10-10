import { formatDuration, intervalToDuration } from "date-fns";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generatePDF(
    timeData: {
        userName: string | null;
        startedAt: Date;
        stoppedAt: Date | null;
        note: string | null;
    }[],
) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width: pageWidth, height: pageHeight } = page.getSize();

    const margin = 36; // 0.5"
    const contentWidth = pageWidth - margin * 2;

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const titleSize = 16;
    const headerSize = 11;
    const cellSize = 10;
    const lineGap = 3;
    const cellPaddingX = 6;
    const cellPaddingY = 6;
    const borderWidth = 0.5;

    const staticCols = [
        { key: "user", title: "User", width: 110 },
        { key: "start", title: "Start", width: 120 },
        { key: "stop", title: "Stop", width: 120 },
        { key: "duration", title: "Duration", width: 80 },
    ];
    const fixedWidth = staticCols.reduce((s, c) => s + c.width, 0);
    const noteWidth = Math.max(120, contentWidth - fixedWidth);
    const columns = [
        ...staticCols,
        { key: "note", title: "Note", width: noteWidth },
    ] as const;

    function formatDate(d: Date | null) {
        if (!d) return "-";
        try {
            return new Date(d).toLocaleString();
        } catch {
            return "-";
        }
    }

    function wrapText(text: string, maxWidth: number, useBold = false) {
        const f = useBold ? boldFont : font;
        const size = cellSize;
        const words = (text ?? "")
            .toString()
            .replace(/\r/g, "")
            .split(/\s+/)
            .filter(Boolean);
        const lines: string[] = [];
        let current = "";

        const measure = (t: string) => f.widthOfTextAtSize(t, size);

        for (const word of words) {
            const tentative = current ? `${current} ${word}` : word;
            if (measure(tentative) <= maxWidth) {
                current = tentative;
                continue;
            }
            if (!current) {
                // Word longer than max width, hard-break
                let buf = "";
                for (const ch of word) {
                    if (measure(buf + ch) <= maxWidth) {
                        buf += ch;
                    } else {
                        if (buf) lines.push(buf);
                        buf = ch;
                    }
                }
                if (buf) {
                    current = buf;
                }
            } else {
                lines.push(current);
                current = word;
            }
        }
        if (current) lines.push(current);
        if (lines.length === 0) lines.push("");
        return lines;
    }

    function computeRowLines(row: {
        userName: string | null;
        startedAt: Date;
        stoppedAt: Date | null;
        note: string | null;
    }) {
        const user = (row.userName ?? "").toString();
        const start = formatDate(row.startedAt);
        const stop = formatDate(row.stoppedAt);
        const duration = formatDuration(
            intervalToDuration({
                start: row.startedAt,
                end: row.stoppedAt ?? new Date(),
            }),
        );
        const note = (row.note ?? "").toString();

        const cellTexts = [
            wrapText(user, columns[0].width - 2 * cellPaddingX),
            wrapText(start, columns[1].width - 2 * cellPaddingX),
            wrapText(stop, columns[2].width - 2 * cellPaddingX),
            wrapText(duration, columns[3].width - 2 * cellPaddingX),
            wrapText(note, columns[4].width - 2 * cellPaddingX),
        ];
        return cellTexts;
    }

    function lineHeight() {
        return cellSize + lineGap;
    }

    let currentPage = page;
    let y = pageHeight - margin;

    function addPage() {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
    }

    function drawTitle() {
        const title = "Time Report";
        currentPage.drawText(title, {
            x: margin,
            y: y - titleSize,
            size: titleSize,
            font: boldFont,
            color: rgb(0, 0, 0),
        });
        y -= titleSize + 12;
    }

    function drawHeader() {
        // Background
        let x = margin;
        const headerHeight = cellSize + 2 * cellPaddingY;
        for (const col of columns) {
            currentPage.drawRectangle({
                x,
                y: y - headerHeight,
                width: col.width,
                height: headerHeight,
                color: rgb(0.95, 0.95, 0.97),
                borderWidth,
                borderColor: rgb(0.7, 0.7, 0.7),
            });
            // Text
            currentPage.drawText(col.title, {
                x: x + cellPaddingX,
                y: y - cellPaddingY - headerSize,
                size: headerSize,
                font: boldFont,
                color: rgb(0, 0, 0),
            });
            x += col.width;
        }
        y -= headerHeight;
    }

    function ensureSpace(requiredHeight: number) {
        if (y - requiredHeight < margin) {
            addPage();
            drawHeader();
        }
    }

    function drawRow(cellLines: string[][]) {
        const maxLines = Math.max(...cellLines.map((l) => l.length));
        const rowHeight = Math.max(
            maxLines * lineHeight() + 2 * cellPaddingY - lineGap,
            cellSize + 2 * cellPaddingY,
        );

        ensureSpace(rowHeight);

        let x = margin;
        // Cells
        for (let c = 0; c < columns.length; c++) {
            currentPage.drawRectangle({
                x,
                y: y - rowHeight,
                width: columns[c].width,
                height: rowHeight,
                borderWidth,
                borderColor: rgb(0.85, 0.85, 0.85),
            });

            // Text lines
            const lines = cellLines[c];
            let textY = y - cellPaddingY - cellSize; // top padding
            for (const line of lines) {
                currentPage.drawText(line, {
                    x: x + cellPaddingX,
                    y: textY,
                    size: cellSize,
                    font,
                    color: rgb(0, 0, 0),
                });
                textY -= lineHeight();
            }

            x += columns[c].width;
        }
        y -= rowHeight;
    }

    // Title + header
    drawTitle();
    drawHeader();

    // Rows
    for (const row of timeData) {
        const lines = computeRowLines(row);
        drawRow(lines);
    }

    const bytes = await pdfDoc.save();
    return bytes;
}
