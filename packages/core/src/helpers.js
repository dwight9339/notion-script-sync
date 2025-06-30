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
exports.normalize = void 0;
exports.getScriptBlockId = getScriptBlockId;
exports.getStoryboardDbId = getStoryboardDbId;
exports.getProjectPageTitle = getProjectPageTitle;
var notion_1 = require("./notion");
var normalize = function (s) { return (s !== null && s !== void 0 ? s : "").trim().toLowerCase(); };
exports.normalize = normalize;
function getScriptBlockId(projectPageId) {
    return __awaiter(this, void 0, void 0, function () {
        var children, scriptPage, scriptBlocks, scriptBlock;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, notion_1.listBlockChildren)(projectPageId)];
                case 1:
                    children = (_a.sent());
                    scriptPage = children.find(function (b) { return b.type === "child_page" && (0, exports.normalize)(b.child_page.title) === "script"; });
                    if (!scriptPage)
                        throw new Error("Script page not found in project page.");
                    return [4 /*yield*/, (0, notion_1.listBlockChildren)(scriptPage.id)];
                case 2:
                    scriptBlocks = (_a.sent());
                    scriptBlock = scriptBlocks.find(function (b) {
                        var _a, _b, _c, _d, _e, _f;
                        return b.type === "toggle" &&
                            (0, exports.normalize)((_c = (_b = (_a = b.toggle.rich_text) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.plain_text) !== null && _c !== void 0 ? _c : (_f = (_e = (_d = b.toggle.rich_text) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text) === null || _f === void 0 ? void 0 : _f.content) === "script";
                    });
                    if (!scriptBlock)
                        throw new Error("Script block not found in script page.");
                    return [2 /*return*/, scriptBlock.id];
            }
        });
    });
}
function getStoryboardDbId(projectPageId) {
    return __awaiter(this, void 0, void 0, function () {
        var children, storyboardPage, storyboardBlocks, storyboardDbBlock;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, notion_1.listBlockChildren)(projectPageId)];
                case 1:
                    children = (_a.sent());
                    storyboardPage = children.find(function (b) { return b.type === "child_page" && (0, exports.normalize)(b.child_page.title) === "storyboard"; });
                    if (!storyboardPage)
                        throw new Error("Storyboard page not found in project page.");
                    return [4 /*yield*/, (0, notion_1.listBlockChildren)(storyboardPage.id)];
                case 2:
                    storyboardBlocks = (_a.sent());
                    storyboardDbBlock = storyboardBlocks.find(function (b) {
                        return b.type === "child_database" &&
                            (0, exports.normalize)(b.child_database.title) === "storyboard";
                    });
                    if (!storyboardDbBlock)
                        throw new Error("Storyboard database block not found in storyboard page.");
                    return [2 /*return*/, storyboardDbBlock.id];
            }
        });
    });
}
function getProjectPageTitle(projectPageId) {
    return __awaiter(this, void 0, void 0, function () {
        var page, titleProp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, notion_1.retrievePage)(projectPageId)];
                case 1:
                    page = _a.sent();
                    titleProp = Object.values(page.properties).find(function (prop) { return prop.type === "title"; });
                    if (!titleProp || titleProp.title.length === 0) {
                        throw new Error("Title property not found or empty.");
                    }
                    // Concatenate all rich-text segments (usually there’s just one)
                    return [2 /*return*/, titleProp.title.map(function (t) { return t.plain_text; }).join("")];
            }
        });
    });
}
