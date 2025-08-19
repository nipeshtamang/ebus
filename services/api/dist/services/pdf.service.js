"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.htmlToPdfBuffer = htmlToPdfBuffer;
const puppeteer_1 = __importDefault(require("puppeteer"));
async function htmlToPdfBuffer(html) {
    const browser = await puppeteer_1.default.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        headless: true,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();
    return Buffer.from(pdfBuffer);
}
