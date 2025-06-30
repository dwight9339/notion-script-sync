"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFormattedScriptToggle = updateFormattedScriptToggle;
function getPlain(prop) {
    var _a, _b;
    if (!prop)
        return "";
    switch (prop.type) {
        case "title":
        case "rich_text":
            return prop[prop.type]
                .map(function (t) { return t.plain_text; })
                .join("");
        case "select":
            return (_b = (_a = prop.select) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "";
        default:
            return "";
    }
}
function rowsToBlocks(rows) {
    var blocks = [];
    var currentSection = "";
    var currentParagraph = "";
    var makeText = function (content) { return [{ type: "text", text: { content: content } }]; };
    for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
        var row = rows_1[_i];
        if (row.section !== currentSection) {
            currentSection = row.section;
            blocks.push({
                object: "block",
                type: "heading_2",
                heading_2: { rich_text: makeText(currentSection), color: "default", is_toggleable: false }
            });
            currentParagraph = "";
        }
        if (row.paragraph !== currentParagraph) {
            currentParagraph = row.paragraph;
            blocks.push({
                object: "block",
                type: "heading_3",
                heading_3: { rich_text: makeText(currentParagraph), color: "default", is_toggleable: false }
            });
        }
        var bulletText = "".concat(row.beatText, "\n").concat(row.visualDescription ? "*" + row.visualDescription + "*" : "*TBD*");
        blocks.push({
            object: "block",
            type: "bulleted_list_item",
            bulleted_list_item: { rich_text: makeText(bulletText), color: "default" }
        });
    }
    return blocks;
}
function updateFormattedScriptToggle(notion, storyboardDbId, formattedToggleId) {
    return __awaiter(this, void 0, void 0, function () {
        var resp, rows, newBlocks, existing, _i, _a, child;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, notion.databases.query({
                        database_id: storyboardDbId,
                        sorts: [{ property: "Order", direction: "ascending" }],
                        page_size: 100
                    })];
                case 1:
                    resp = (_b.sent());
                    rows = resp.results
                        .filter(function (r) { return r.object === "page"; })
                        .map(function (page) {
                        var _a, _b;
                        var p = page.properties;
                        return {
                            section: getPlain(p["Section"]),
                            paragraph: getPlain(p["Paragraph"]),
                            order: (_b = (_a = p["Order"]) === null || _a === void 0 ? void 0 : _a.number) !== null && _b !== void 0 ? _b : 0,
                            beatText: getPlain(p["Beat Text"]),
                            visualDescription: getPlain(p["Visual Description"])
                        };
                    });
                    newBlocks = rowsToBlocks(rows);
                    return [4 /*yield*/, notion.blocks.children.list({ block_id: formattedToggleId })];
                case 2:
                    existing = _b.sent();
                    _i = 0, _a = existing.results;
                    _b.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    child = _a[_i];
                    return [4 /*yield*/, notion.blocks.update({ block_id: child.id, archived: true })];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: 
                // 3. Append fresh formatted blocks
                return [4 /*yield*/, notion.blocks.children.append({
                        block_id: formattedToggleId,
                        children: newBlocks
                    })];
                case 7:
                    // 3. Append fresh formatted blocks
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
