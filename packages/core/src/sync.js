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
exports.getProjectPageId = getProjectPageId;
exports.syncStoryboard = syncStoryboard;
var notion_1 = require("./notion");
function getProjectPageId(rowId) {
    return __awaiter(this, void 0, void 0, function () {
        var row, scriptPageId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, notion_1.retrievePage)(rowId)];
                case 1:
                    row = _a.sent();
                    if (!row.properties["Run Sync"].checkbox) {
                        throw new Error("'Run Sync' not checked. Aborting.");
                    }
                    scriptPageId = row.properties["Script Page"].title[0].href.split("/").pop();
                    if (!scriptPageId) {
                        throw new Error("Project Page ID Not Found");
                    }
                    return [2 /*return*/, scriptPageId];
            }
        });
    });
}
function getScript(scriptBlockId) {
    return __awaiter(this, void 0, void 0, function () {
        var script, sections, i, section, sectionObj, paragraphs, j, paragraph, paragraphObj, beats, k, beat, richText, oldId, content, storyboardRowId, firstPart, restText, url, match, formatNum, beatObj;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    script = [];
                    return [4 /*yield*/, (0, notion_1.listBlockChildren)(scriptBlockId)];
                case 1:
                    sections = _b.sent();
                    i = 0;
                    _b.label = 2;
                case 2:
                    if (!(i < sections.length)) return [3 /*break*/, 9];
                    section = sections[i];
                    sectionObj = {
                        title: section.toggle.rich_text[0].plain_text,
                        paragraphs: []
                    };
                    return [4 /*yield*/, (0, notion_1.listBlockChildren)(section.id)];
                case 3:
                    paragraphs = _b.sent();
                    j = 0;
                    _b.label = 4;
                case 4:
                    if (!(j < paragraphs.length)) return [3 /*break*/, 7];
                    paragraph = paragraphs[j];
                    paragraphObj = {
                        title: paragraph.toggle.rich_text[0].plain_text,
                        beats: []
                    };
                    return [4 /*yield*/, (0, notion_1.listBlockChildren)(paragraph.id)];
                case 5:
                    beats = _b.sent();
                    for (k = 0; k < beats.length; k++) {
                        beat = beats[k];
                        console.log("Processing beat ".concat(i + 1, ".").concat(j + 1, ".").concat(k + 1, ":"), beat);
                        richText = beat.bulleted_list_item.rich_text;
                        oldId = "";
                        content = "";
                        storyboardRowId = void 0;
                        if (richText.length > 0) {
                            firstPart = richText[0];
                            restText = richText.slice(1).map(function (rt) { return rt.plain_text; }).join("").trim();
                            // If the first rich text part is a link and looks like [beatId]
                            if (firstPart.type === "text" &&
                                ((_a = firstPart.text.link) === null || _a === void 0 ? void 0 : _a.url) &&
                                firstPart.plain_text.startsWith("[") &&
                                firstPart.plain_text.endsWith("]")) {
                                oldId = firstPart.plain_text.replace(/^\[|\]$/g, "").trim();
                                url = firstPart.text.link.url;
                                match = url.match(/\/([a-f0-9]{32})$/);
                                if (match) {
                                    storyboardRowId = match[1].replace(/([a-f0-9]{8})([a-f0-9]{4})([a-f0-9]{4})([a-f0-9]{4})([a-f0-9]{12})/, "$1-$2-$3-$4-$5");
                                }
                                content = restText.replace(/^:\s*/, "");
                            }
                            else {
                                // No link or not formatted properly
                                content = richText.map(function (rt) { return rt.plain_text; }).join("").trim();
                            }
                        }
                        formatNum = function (num) { return num.toString().padStart(2, "0"); };
                        beatObj = {
                            notionId: beat.id,
                            id: "".concat(formatNum(i + 1), ".").concat(formatNum(j + 1), ".").concat(formatNum(k + 1)),
                            content: content,
                            oldId: oldId,
                            storyboardRowId: storyboardRowId
                        };
                        paragraphObj.beats.push(beatObj);
                    }
                    sectionObj.paragraphs.push(paragraphObj);
                    _b.label = 6;
                case 6:
                    j++;
                    return [3 /*break*/, 4];
                case 7:
                    script.push(sectionObj);
                    _b.label = 8;
                case 8:
                    i++;
                    return [3 /*break*/, 2];
                case 9: return [2 /*return*/, script];
            }
        });
    });
}
function syncStoryboard(scriptBlockId, storyboardDbId) {
    return __awaiter(this, void 0, void 0, function () {
        var script, _i, script_1, section, _a, _b, paragraph, _c, _d, beat, isNewBeat, error_1, newRow, rowLink, error_2;
        var _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, getScript(scriptBlockId)];
                case 1:
                    script = _f.sent();
                    _i = 0, script_1 = script;
                    _f.label = 2;
                case 2:
                    if (!(_i < script_1.length)) return [3 /*break*/, 16];
                    section = script_1[_i];
                    _a = 0, _b = section.paragraphs;
                    _f.label = 3;
                case 3:
                    if (!(_a < _b.length)) return [3 /*break*/, 15];
                    paragraph = _b[_a];
                    _c = 0, _d = paragraph.beats;
                    _f.label = 4;
                case 4:
                    if (!(_c < _d.length)) return [3 /*break*/, 14];
                    beat = _d[_c];
                    console.log("Processing beat: ".concat(JSON.stringify(beat)));
                    isNewBeat = beat.storyboardRowId === undefined;
                    if (!(!isNewBeat && beat.storyboardRowId)) return [3 /*break*/, 8];
                    _f.label = 5;
                case 5:
                    _f.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, (0, notion_1.updatePage)(beat.storyboardRowId, {
                            "Beat ID": {
                                title: [
                                    {
                                        text: {
                                            content: beat.id
                                        }
                                    }
                                ]
                            },
                            "Section": {
                                rich_text: [
                                    {
                                        text: {
                                            content: section.title
                                        }
                                    }
                                ]
                            },
                            "Paragraph": {
                                rich_text: [
                                    {
                                        text: {
                                            content: paragraph.title
                                        }
                                    }
                                ]
                            },
                            "Beat Text": {
                                rich_text: [
                                    {
                                        text: {
                                            content: beat.content
                                        }
                                    }
                                ]
                            }
                        })];
                case 6:
                    _f.sent();
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _f.sent();
                    console.warn("Beat ".concat(beat.id, " not found in storyboard, creating new entry."));
                    isNewBeat = true; // If update fails, treat it as a new beat
                    return [3 /*break*/, 8];
                case 8:
                    if (!isNewBeat) return [3 /*break*/, 10];
                    return [4 /*yield*/, (0, notion_1.createPageInDatabase)(storyboardDbId, {
                            "Beat ID": {
                                title: [
                                    {
                                        text: {
                                            content: beat.id
                                        }
                                    }
                                ]
                            },
                            "Beat Text": {
                                rich_text: [
                                    {
                                        text: {
                                            content: beat.content
                                        }
                                    }
                                ]
                            },
                            "Visual Description": {
                                rich_text: [
                                    {
                                        text: {
                                            content: "TBD"
                                        }
                                    }
                                ]
                            }
                        })];
                case 9:
                    newRow = _f.sent();
                    beat.storyboardRowId = newRow.id;
                    _f.label = 10;
                case 10:
                    _f.trys.push([10, 12, , 13]);
                    rowLink = "https://www.notion.so/".concat((_e = beat.storyboardRowId) === null || _e === void 0 ? void 0 : _e.replace(/-/g, ""));
                    return [4 /*yield*/, (0, notion_1.updateBlock)(beat.notionId, {
                            rich_text: [
                                {
                                    type: "text",
                                    text: {
                                        content: "[".concat(beat.id, "]"),
                                        link: {
                                            url: rowLink
                                        }
                                    }
                                },
                                {
                                    type: "text",
                                    text: {
                                        content: ": ".concat(beat.content)
                                    }
                                }
                            ]
                        })];
                case 11:
                    _f.sent();
                    return [3 /*break*/, 13];
                case 12:
                    error_2 = _f.sent();
                    console.error("Error updating beat block with ID ".concat(beat.id, ":"), error_2);
                    return [3 /*break*/, 13];
                case 13:
                    _c++;
                    return [3 /*break*/, 4];
                case 14:
                    _a++;
                    return [3 /*break*/, 3];
                case 15:
                    _i++;
                    return [3 /*break*/, 2];
                case 16: return [2 /*return*/];
            }
        });
    });
}
