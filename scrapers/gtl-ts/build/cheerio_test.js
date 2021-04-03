"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = __importStar(require("cheerio"));
const fs_1 = __importDefault(require("fs"));
const $ = cheerio.load(fs_1.default.readFileSync(__dirname + "/hello.html"));
console.log(estimateStringToAmount);
console.log(live_agent_fee);
console.log(automated_payment_fee);
console.log(paper_bill_statement_fee);
// var xml = fs.readFileSync(__dirname + "/hello.html");
// var xmlDoc = libxmljs.parseXml(xml);
// var result = xmlDoc.get(
//     "//strong[contains(., 'The estimated cost of a phone call')]"
// );
// console.log(result);
// var xmlDoc = libxmljs.parseXml(xml);
