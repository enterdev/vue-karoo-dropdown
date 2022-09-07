"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemSizeClass = void 0;
var vue_property_decorator_1 = require("vue-property-decorator");
var ItemSizeClass;
(function (ItemSizeClass) {
    ItemSizeClass["FullWidth"] = "full-width";
    ItemSizeClass["LineBreak"] = "line-break";
    ItemSizeClass["Ellipsis"] = "ellipsis";
})(ItemSizeClass = exports.ItemSizeClass || (exports.ItemSizeClass = {}));
var VueDropdown = /** @class */ (function (_super) {
    __extends(VueDropdown, _super);
    function VueDropdown() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.nothingFoundText = {
            'lv': 'Nav atrasts',
            'ru': 'Ничего не найдено',
            'en': 'Nothing found'
        };
        _this.levelField = 'level';
        _this.isParentField = 'isParent';
        _this.selected = {};
        _this.preSelected = {};
        _this.open = false;
        _this.searchInput = '';
        _this.selectedByArrow = false;
        _this.mobileScreen = 500;
        _this.placeholder = "";
        _this.newOptions = [];
        _this.filteredOptions = [];
        _this.currentIndex = null;
        _this.currentElementId = null;
        _this.elementHeight = 0;
        _this.selectHeight = 0;
        return _this;
    }
    VueDropdown.prototype.onOptionsChanged = function () {
        this.reset();
        this.normalizeOptions();
        this.setOption(this.getSelectedOption());
    };
    Object.defineProperty(VueDropdown.prototype, "getFilteredOptions", {
        get: function () {
            var _this = this;
            this.filteredOptions = [];
            this.$nextTick(function () {
                _this.updateDropdownPosition();
            });
            var regOption = new RegExp(this.searchInput, 'ig');
            this.newOptions.forEach(function (option) {
                if (_this.searchInput.length < 1 ||
                    (option.searchHint && option.searchHint.match(regOption) || option.name.match(regOption)))
                    if (_this.filteredOptions.indexOf(option) != 0)
                        _this.filteredOptions.push(option);
            });
            if (!this.filteredOptions.length)
                this.filteredOptions.push({ name: this.nothingFoundText[this.languageField] });
            if (!this.selectedByArrow) {
                if (this.searchInput.length > 0)
                    this.preSetOption(this.filteredOptions[0]);
                else
                    this.preSetOption(this.getSelectedOption());
            }
            return this.filteredOptions;
        },
        enumerable: false,
        configurable: true
    });
    VueDropdown.prototype.created = function () {
        if (!Object.values(ItemSizeClass).includes(this.itemSize))
            console.error("Unexpected item-size prop value: " + this.itemSize + " <--\n" +
                "Available values: " + Object.values(ItemSizeClass));
        this.normalizeOptions();
        this.setOption(this.getSelectedOption());
    };
    VueDropdown.prototype.selectByClick = function (option, event) {
        if (event)
            event.preventDefault();
        this.setOption(option);
        this.exit();
    };
    VueDropdown.prototype.setOption = function (option) {
        if (!option)
            return false;
        if (typeof option.id == 'undefined')
            return;
        this.selected = option;
        this.preSelected = option;
        this.placeholder = option.name;
        this.updateIndex();
        this.adjustScroll();
        this.$emit('input', option.id);
        this.$emit('change', this.deepCopy(option));
        return true;
    };
    VueDropdown.prototype.preSetOption = function (option) {
        if (this.newOptions.length == 0)
            return false;
        if (typeof option == 'undefined') {
            this.preSetOption(this.newOptions[0]);
            return false;
        }
        this.preSelected = option;
        this.updateIndex();
        this.adjustScroll();
        return true;
    };
    VueDropdown.prototype.selectOption = function (option) {
        if (this.open)
            this.preSetOption(option);
        else
            this.setOption(option);
    };
    VueDropdown.prototype.getSelectedOption = function () {
        var _this = this;
        var selectedOption;
        this.newOptions.forEach(function (option) {
            if (typeof _this.id == 'undefined' || _this.id === null) {
                if (option.id == 0)
                    selectedOption = option;
            }
            else {
                if (option.id == _this.id)
                    selectedOption = option;
            }
        });
        return selectedOption;
    };
    VueDropdown.prototype.keyActions = function (e) {
        var _a, _b;
        if (this.searchable)
            this.searchableActions(e);
        else
            this.nonSearchableActions(e);
        if (e.keyCode === 38) // ArrowUp
        {
            e.preventDefault();
            this.moveUp();
        }
        if (e.keyCode === 40) // ArrowDown
        {
            e.preventDefault();
            this.moveDown();
        }
        if (e.keyCode === 27 && this.open) // Esc
        {
            e.stopPropagation();
            this.exit();
        }
        if (e.keyCode === 32 && !this.open) // Space bar
        {
            e.preventDefault();
            this.toggleDropdown();
        }
        if (e.keyCode == 35) //end
        {
            e.preventDefault();
            this.selectedByArrow = true;
            this.selectOption(this.filteredOptions[this.filteredOptions.length - 1]);
        }
        if (e.keyCode == 36) //home
        {
            e.preventDefault();
            this.selectedByArrow = true;
            this.selectOption(this.filteredOptions[0]);
        }
        if (e.keyCode === 33) // PageUp
        {
            e.preventDefault();
            this.selectedByArrow = true;
            this.selectOption((_a = (this.filteredOptions[this.currentIndex - 3])) !== null && _a !== void 0 ? _a : this.filteredOptions[0]);
        }
        if (e.keyCode === 34) // PageDown
        {
            e.preventDefault();
            this.selectedByArrow = true;
            this.selectOption((_b = (this.filteredOptions[this.currentIndex + 3])) !== null && _b !== void 0 ? _b : this.filteredOptions[this.filteredOptions.length - 1]);
        }
    };
    VueDropdown.prototype.nonSearchableActions = function (e) {
        var _this = this;
        if ((e.keyCode === 13 || e.keyCode === 9) && this.open) // Enter or Tab
        {
            this.setOption(this.filteredOptions[this.currentIndex]);
            this.exit();
        }
        var key = e.key.toLowerCase();
        var options = function () {
            var items = [];
            _this.filteredOptions.forEach(function (option) {
                var name = option.name.toLowerCase();
                if (name.startsWith(key))
                    items.push(option);
            });
            return items;
        };
        if (e.code.match(/BracketLeft|BracketRight|Semicolon|Quote|Comma|Period|Key+/g)) {
            var currentKey = this.filteredOptions[this.currentIndex].name.charAt(0).toLowerCase();
            var firstOption = options()[0];
            var lastOption = options()[options().length - 1];
            this.selectedByArrow = true;
            for (var i = this.currentIndex; i < this.filteredOptions.length; i++) {
                var option = this.filteredOptions[i];
                var name_1 = option.name.toLowerCase();
                if (key != currentKey) {
                    if (options().length)
                        this.selectOption(firstOption);
                    break;
                }
                if (name_1.startsWith(key)) {
                    if (lastOption == this.filteredOptions[this.currentIndex]) {
                        this.selectOption(firstOption);
                        break;
                    }
                    if (this.filteredOptions[this.currentIndex] == option)
                        continue;
                    this.selectOption(option);
                    break;
                }
            }
        }
    };
    VueDropdown.prototype.searchableActions = function (e) {
        if (e.code.match(/Digit|Backspace|Minus|Key+/g) && !e.altKey) {
            this.selectedByArrow = false;
            if (!this.open)
                this.toggleDropdown();
        }
        else if (e.code.match(/BracketLeft|BracketRight|Semicolon|Quote|Comma|Period|Key+/g) && e.altKey) {
            e.preventDefault();
            this.nonSearchableActions(e);
        }
        if (e.keyCode === 9 && this.open) // Tab
        {
            if (this.selectedByArrow)
                this.setOption(this.filteredOptions[this.currentIndex]);
            else if (this.selected != this.preSelected)
                this.setOption(this.filteredOptions[0]);
            this.exit();
        }
        if (e.keyCode === 13 && this.filteredOptions[0] && this.open) // Enter
        {
            if (this.selectedByArrow)
                this.setOption(this.filteredOptions[this.currentIndex]);
            else
                this.setOption(this.filteredOptions[0]);
            this.exit();
        }
    };
    VueDropdown.prototype.moveUp = function () {
        if (!this.open) {
            this.toggleDropdown();
            return;
        }
        this.selectedByArrow = true;
        for (var i = this.currentIndex - 1; i >= 0; i--) {
            if (this.preSetOption(this.filteredOptions[i])) {
                this.currentIndex = i;
                break;
            }
        }
    };
    VueDropdown.prototype.moveDown = function () {
        if (!this.open) {
            this.toggleDropdown();
            return;
        }
        this.selectedByArrow = true;
        for (var i = this.currentIndex + 1; i < this.filteredOptions.length; i++) {
            if (this.preSetOption(this.filteredOptions[i])) {
                this.currentIndex = i;
                break;
            }
        }
    };
    VueDropdown.prototype.normalizeOptions = function () {
        var options = this.options;
        var newOptions = [];
        if (!options.length) {
            this.newOptions = [];
            return;
        }
        var isNonObjectArray = typeof options[0] == "string";
        for (var prop in options) {
            var isParent = options[prop][this.isParentField];
            newOptions.push({
                'id': isNonObjectArray ? options[prop] : options[prop][this.valueField],
                'name': isNonObjectArray ? options[prop] : options[prop][this.textField],
                'searchHint': isNonObjectArray ? options[prop] : options[prop][this.valueSearchHint],
                'level': options[prop][this.levelField],
                'isParent': typeof isParent == "undefined" ? false : isParent,
            });
        }
        this.newOptions = newOptions;
    };
    VueDropdown.prototype.toggleDropdown = function (event) {
        var _this = this;
        if (event === void 0) { event = null; }
        var searchInputEl = this.$refs.searchInput;
        if (event && event.target === searchInputEl)
            return;
        if (this.open) {
            this.exit();
            return;
        }
        this.open = true;
        this.searchInput = '';
        var dropdown = this.$refs.dropdown;
        var pos = dropdown.getBoundingClientRect();
        this.selectHeight = dropdown.clientHeight;
        this.$nextTick(function () {
            if (_this.searchable)
                searchInputEl.focus();
            var elementId = Math.random().toString(16).slice(2);
            var dropdownBox = _this.$refs.dropdownBox;
            if (_this.elementHeight == 0)
                _this.elementHeight = dropdownBox.clientHeight;
            var scrollY = window.scrollY || window.pageYOffset;
            var scrollX = window.scrollX || window.pageXOffset;
            dropdownBox.id = elementId;
            dropdownBox.style.top = _this.isBottom(pos) ?
                (scrollY + pos.top - _this.elementHeight) + "px" : (scrollY + pos.top + pos.height) + "px";
            dropdownBox.style.left = (scrollX + pos.left) + "px";
            if (_this.itemSize == ItemSizeClass.FullWidth)
                dropdownBox.style.minWidth = pos.width + "px";
            else
                dropdownBox.style.width = pos.width + "px";
            _this.currentElementId = elementId;
            _this.setOption(_this.getSelectedOption());
            document.body.appendChild(dropdownBox);
            _this.adjustScroll();
        });
    };
    VueDropdown.prototype.exit = function () {
        if (!this.open)
            return;
        this.searchInput = '';
        this.open = false;
        this.$emit('input', this.selected.id);
        var dropdownBox = this.$refs.dropdownBox;
        var dropdownLabel = this.$refs.dropdownLabel;
        dropdownLabel.focus();
        dropdownBox.remove();
    };
    VueDropdown.prototype.updateDropdownPosition = function () {
        var dropdownBox = this.$refs.dropdownBox;
        if (!dropdownBox)
            return;
        var el = document.getElementById(this.currentElementId);
        var dropdown = this.$refs.dropdown;
        var pos = dropdown.getBoundingClientRect();
        this.elementHeight = dropdownBox.clientHeight;
        var scrollY = window.scrollY || window.pageYOffset;
        var scrollX = window.scrollX || window.pageXOffset;
        el.style.top = this.isBottom(pos) ?
            (scrollY + pos.top - this.elementHeight) + "px" : (scrollY + pos.top + pos.height) + "px";
        el.style.left = (scrollX + pos.left) + "px";
        if (this.itemSize == ItemSizeClass.FullWidth)
            el.style.minWidth = pos.width + "px";
        else
            el.style.width = pos.width + "px";
    };
    VueDropdown.prototype.updateIndex = function () {
        var _this = this;
        this.filteredOptions.forEach(function (option) {
            if (_this.preSelected.id == option.id) {
                _this.currentIndex = _this.filteredOptions.indexOf(option);
                return;
            }
        });
    };
    VueDropdown.prototype.adjustScroll = function () {
        var dropdownList = this.$refs.dropdownList;
        var optionEl = (dropdownList === null || dropdownList === void 0 ? void 0 : dropdownList.children[this.currentIndex]) || false;
        if (!optionEl)
            return;
        var bounds = this.getDropdownViewport();
        var _a = optionEl.getBoundingClientRect(), top = _a.top, bottom = _a.bottom, height = _a.height;
        if (top < bounds.top)
            return (dropdownList.scrollTop = optionEl.offsetTop);
        else if (bottom > bounds.bottom)
            return (dropdownList.scrollTop = optionEl.offsetTop - (bounds.height - height));
    };
    VueDropdown.prototype.getDropdownViewport = function () {
        var dropdownList = this.$refs.dropdownList;
        return dropdownList ? dropdownList.getBoundingClientRect() : { height: 0, top: 0, bottom: 0 };
    };
    VueDropdown.prototype.scrollOutside = function () {
        var _this = this;
        this.updateDropdownPosition();
        this.$nextTick(function () {
            var el = document.getElementById(_this.currentElementId);
            if (!_this.isInViewport(el) && !_this.isMobile())
                _this.exit();
        });
    };
    VueDropdown.prototype.isInViewport = function (el) {
        var rect = el.getBoundingClientRect();
        return !(((rect.top + el.clientHeight + this.selectHeight) < 0) ||
            (rect.top - this.selectHeight) > window.innerHeight);
    };
    VueDropdown.prototype.isMobile = function () {
        return screen.width < this.mobileScreen;
    };
    VueDropdown.prototype.isBottom = function (pos) {
        return window.innerHeight - this.elementHeight < pos.bottom;
    };
    VueDropdown.prototype.reset = function () {
        this.selected = {};
        this.placeholder = null;
    };
    VueDropdown.prototype.deepCopy = function (initialObject, replacer) {
        if (replacer === void 0) { replacer = null; }
        if (!initialObject)
            return null;
        return JSON.parse(JSON.stringify(initialObject, replacer));
    };
    __decorate([
        vue_property_decorator_1.Model("input")
    ], VueDropdown.prototype, "id", void 0);
    __decorate([
        vue_property_decorator_1.Prop({ default: ItemSizeClass.FullWidth })
    ], VueDropdown.prototype, "itemSize", void 0);
    __decorate([
        vue_property_decorator_1.Prop({ default: [] })
    ], VueDropdown.prototype, "options", void 0);
    __decorate([
        vue_property_decorator_1.Watch('id', { immediate: true, deep: true }),
        vue_property_decorator_1.Watch('options', { immediate: true, deep: true })
    ], VueDropdown.prototype, "onOptionsChanged", null);
    __decorate([
        vue_property_decorator_1.Prop({ default: 'name' })
    ], VueDropdown.prototype, "textField", void 0);
    __decorate([
        vue_property_decorator_1.Prop({ default: 'id' })
    ], VueDropdown.prototype, "valueField", void 0);
    __decorate([
        vue_property_decorator_1.Prop([String])
    ], VueDropdown.prototype, "valueSearchHint", void 0);
    __decorate([
        vue_property_decorator_1.Prop({ default: true })
    ], VueDropdown.prototype, "searchable", void 0);
    __decorate([
        vue_property_decorator_1.Prop({ default: 'en' })
    ], VueDropdown.prototype, "languageField", void 0);
    VueDropdown = __decorate([
        vue_property_decorator_1.Component({
            directives: {
                'scroll-outside': {
                    inserted: function (el, binding) {
                        el['scroll-outside-handler'] = function (e) {
                            if (!el.contains(e.target))
                                binding.value(e);
                        };
                        document.addEventListener('scroll', el['scroll-outside-handler'], { capture: true });
                    },
                    unbind: function (el) {
                        document.removeEventListener('scroll', el['scroll-outside-handler'], { capture: true });
                    },
                },
                'mousedown-outside': {
                    inserted: function (el, binding) {
                        el['mousedown-outside-handler'] = function (e) {
                            if (!el.contains(e.target) && typeof e.target.dataset.mousedownPrevent === 'undefined')
                                binding.value(e);
                        };
                        document.addEventListener('mousedown', el['mousedown-outside-handler'], { capture: true });
                    },
                    unbind: function (el) {
                        document.removeEventListener('mousedown', el['mousedown-outside-handler'], { capture: true });
                    },
                },
            },
            template: "\n      <div class=\"dropdown\" v-mousedown-outside=\"exit\" v-if=\"options\" ref=\"dropdown\">\n\n      <div v-if=\"searchable\" ref=\"dropdownLabel\" v-bind:tabindex=\"0\" class=\"dropdown-label\"\n          v-on:click=\"toggleDropdown($event)\" v-on:keydown=\"keyActions\">\n                <span v-show=\"!open\">\n                    <slot name=\"selected-item\" v-bind:selected=\"selected\">{{ selected.name }}</slot>\n                </span>\n\n        <input type=\"search\" ref=\"searchInput\" v-show=\"open\" class=\"dropdown-input\"\n            v-bind:value=\"searchInput\"\n            v-bind:placeholder=\"placeholder\"\n            v-on:input=\"e => searchInput = e.target.value\">\n      </div>\n\n      <div v-else ref=\"dropdownLabel\" v-bind:tabindex=\"0\" class=\"dropdown-label\"\n          v-on:click=\"toggleDropdown($event)\" v-on:keydown=\"keyActions\">\n                    <span>\n                        <slot name=\"selected-item\" ref=\"searchInput\" v-bind:selected=\"selected\">{{ selected.name }}</slot>\n                    </span>\n      </div>\n\n      <div data-mousedown-prevent class=\"dropdown-box\" ref=\"dropdownBox\" v-if=\"open\"\n          v-scroll-outside=\"scrollOutside\">\n\n        <div data-mousedown-prevent ref=\"dropdownList\" class=\"dropdown-content\" v-bind:class=\"itemSize\">\n          <div data-mousedown-prevent class=\"dropdown-item\"\n              v-on:mousedown=\"selectByClick(option, $event)\"\n              v-for=\"(option, index) in getFilteredOptions\"\n              v-bind:class=\"{ active: preSelected.id === option.id, folder: option.isParent }\"\n              v-bind:key=\"index\">\n            <slot name=\"list-item\" v-bind:option=\"option\" v-if=\"option.id\">\n              <span v-for=\"n in option.level\">&nbsp;&nbsp;</span>\n              {{ option.name }}\n            </slot>\n            <span v-else>{{ option.name }}</span>\n          </div>\n        </div>\n      </div>\n\n      </div>\n    "
        })
    ], VueDropdown);
    return VueDropdown;
}(vue_property_decorator_1.Vue));
exports.default = VueDropdown;
