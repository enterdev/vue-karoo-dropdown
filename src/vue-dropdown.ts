import {Vue, Component, Prop, Model, Watch} from 'vue-property-decorator';

export enum ItemSizeClass {
    FullWidth = 'full-width',
    LineBreak = 'line-break',
    Ellipsis  = 'ellipsis'
}

@Component({
    directives: {
        'scroll-outside': {
            inserted(el, binding)
            {
                el['scroll-outside-handler'] = e =>
                {
                    if (!el.contains(e.target))
                        binding.value(e);
                }
                document.addEventListener('scroll', el['scroll-outside-handler'], {capture: true});
            },
            unbind(el)
            {
                document.removeEventListener('scroll', el['scroll-outside-handler'], {capture: true});
            },
        },
        'mousedown-outside': {
            inserted(el, binding)
            {
                el['mousedown-outside-handler'] = e =>
                {
                    if (!el.contains(e.target) && typeof e.target.dataset.mousedownPrevent === 'undefined')
                        binding.value(e);
                }
                document.addEventListener('mousedown', el['mousedown-outside-handler'], {capture: true});
            },
            unbind(el)
            {
                document.removeEventListener('mousedown', el['mousedown-outside-handler'], {capture: true});
            },
        },
    },
    template: `
        <div class="dropdown" v-bind:class="{open: open, bottom: isDropdownBottom}" v-mousedown-outside="exit" v-if="options" ref="dropdown">

            <div v-if="searchable" ref="dropdownLabel" v-bind:tabindex="0" class="dropdown-label"
                v-on:click="toggleDropdown($event)" v-on:keydown="keyActions">
                <span v-show="!open">
                    <slot name="selected-item" v-bind:selected="selected">{{ selected.name }}</slot>
                </span>
    
                <input type="search" ref="searchInput" v-show="open" class="dropdown-input"
                    v-bind:value="searchInput"
                    v-bind:placeholder="placeholder"
                    v-on:input="e => searchInput = e.target.value">
            </div>
    
            <div v-else ref="dropdownLabel" v-bind:tabindex="0" class="dropdown-label"
                v-on:click="toggleDropdown($event)" v-on:keydown="keyActions">
                    <span>
                        <slot name="selected-item" ref="searchInput" v-bind:selected="selected">{{ selected.name }}</slot>
                    </span>
            </div>
    
            <div data-mousedown-prevent class="dropdown-box" ref="dropdownBox" v-if="open"
                v-bind:class="{bottom: isDropdownBottom}"
                v-scroll-outside="scrollOutside">
    
                <div data-mousedown-prevent ref="dropdownList" class="dropdown-content" v-bind:class="itemSize">
                    <div data-mousedown-prevent class="dropdown-item"
                        v-on:mousedown="selectByClick(option, $event)"
                        v-for="(option, index) in getFilteredOptions"
                        v-bind:class="{ active: preSelected.id === option.id, folder: option.isParent }"
                        v-bind:key="index">
                        <slot name="list-item" v-bind:option="option" v-if="option.id">
                            <span v-for="n in option.level">&nbsp;&nbsp;</span>
                            {{ option.name }}
                        </slot>
                        <span v-else>{{ option.name }}</span>
                    </div>
                </div>
            </div>

        </div>
    `
})
export default class VueDropdown extends Vue
{
    @Model("input")
    id: any;

    // Enum: ItemSizeClass
    @Prop({default: ItemSizeClass.FullWidth})
    private itemSize: ItemSizeClass;

    @Prop({default: []})
    options: Array<any>;

    @Watch('id', { immediate: true, deep: true })
    @Watch('options', { immediate: true, deep: true })
    onOptionsChanged()
    {
        this.reset();
        this.normalizeOptions();
        this.setOption(this.getSelectedOption());
    }

    get getFilteredOptions()
    {
        this.filteredOptions = [];

        this.$nextTick(() => {
            this.updateDropdownPosition();
        });

        const regOption = new RegExp(this.searchInput, 'ig');

        this.newOptions.forEach(option =>
        {
            if (this.searchInput.length < 1 ||
                (option.searchHint && option.searchHint.match(regOption) || option.name.match(regOption)))
                if (this.filteredOptions.indexOf(option) != 0)
                    this.filteredOptions.push(option);
        });

        if (!this.filteredOptions.length)
            this.filteredOptions.push({name: this.nothingFoundText[this.languageField]});

        if (!this.selectedByArrow)
        {
            if (this.searchInput.length > 0)
                this.preSetOption(this.filteredOptions[0]);
            else
                this.preSetOption(this.getSelectedOption());
        }

        return this.filteredOptions;
    }

    nothingFoundText = {
        'lv': 'Nav atrasts',
        'ru': 'Ничего не найдено',
        'en': 'Nothing found',
        'lt': 'Nieko nerasta',
        'ee': 'Ei leitud midagi'
    };

    @Prop({default: 'name'})
    textField: any;

    @Prop({default: 'id'})
    valueField: any;

    levelField = 'level';
    isParentField = 'isParent';

    @Prop([String])
    valueSearchHint: any;

    @Prop({default: true})
    searchable: boolean;

    @Prop({default: 'en'})
    languageField: string;

    selected: any               = {};
    preSelected: any            = {};
    open: boolean               = false;
    searchInput: string         = '';
    selectedByArrow: boolean    = false;
    mobileScreen: number        = 500;
    placeholder: string         = "";
    newOptions: Array<any>      = [];
    filteredOptions: Array<any> = [];
    currentIndex: number        = null;
    currentElementId: string    = null;
    elementHeight: number       = 0;
    selectHeight: number        = 0;
    isDropdownBottom: boolean   = false;

    created()
    {
        if (!(<any>Object).values(ItemSizeClass).includes(this.itemSize))
            console.error("Unexpected item-size prop value: " + this.itemSize + " <--\n" +
                "Available values: " + (<any>Object).values(ItemSizeClass));

        this.normalizeOptions();
        this.setOption(this.getSelectedOption());
    }

    selectByClick(option, event)
    {
        // Disable wheel click
        if (event.which == 2)
            return;

        if (event)
            event.preventDefault();

        this.setOption(option);
        this.exit();
    }

    setOption(option)
    {
        if (!option)
            return false;

        if (typeof option.id == 'undefined')
            return;

        this.selected    = option;
        this.preSelected = option;
        this.placeholder = option.name;
        this.updateIndex();
        this.adjustScroll();

        this.$emit('input', option.id);
        this.$emit('change', this.deepCopy(option));

        return true;
    }

    preSetOption(option)
    {
        if (this.newOptions.length == 0)
            return false;

        if (typeof option == 'undefined')
        {
            this.preSetOption(this.newOptions[0]);
            return false;
        }

        this.preSelected = option;
        this.updateIndex();
        this.adjustScroll();

        return true;
    }

    selectOption(option)
    {
        if (this.open)
            this.preSetOption(option)
        else
            this.setOption(option);
    }

    getSelectedOption(): object
    {
        let selectedOption;

        this.newOptions.forEach(option =>
        {
            if (typeof this.id == 'undefined' || this.id === null)
            {
                if (option.id == 0)
                    selectedOption = option;
            } else {
                if (option.id == this.id)
                    selectedOption = option;
            }
        });

        return selectedOption;
    }

    keyActions(e)
    {
        if (this.searchable)
            this.searchableActions(e);
        else
            this.nonSearchableActions(e);

        if (e.keyCode === 38) // ArrowUp
        {
            e.preventDefault()
            this.moveUp();
        }

        if (e.keyCode === 40) // ArrowDown
        {
            e.preventDefault()
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
            this.selectOption(this.filteredOptions[this.filteredOptions.length - 1])
        }

        if (e.keyCode == 36) //home
        {
            e.preventDefault();
            this.selectedByArrow = true;
            this.selectOption(this.filteredOptions[0])
        }

        if (e.keyCode === 33) // PageUp
        {
            e.preventDefault()
            this.selectedByArrow = true;
            this.selectOption((this.filteredOptions[this.currentIndex - 3]) ?? this.filteredOptions[0])
        }

        if (e.keyCode === 34) // PageDown
        {
            e.preventDefault()
            this.selectedByArrow = true;
            this.selectOption((this.filteredOptions[this.currentIndex + 3]) ??
                this.filteredOptions[this.filteredOptions.length - 1])
        }
    }

    nonSearchableActions(e)
    {
        if ((e.keyCode === 13 || e.keyCode === 9) && this.open) // Enter or Tab
        {
            this.setOption(this.filteredOptions[this.currentIndex]);
            this.exit();
        }

        let key = e.key.toLowerCase();

        let options = () =>
        {
            let items = [];
            this.filteredOptions.forEach(option => {
                let name = option.name.toLowerCase();

                if (name.startsWith(key))
                    items.push(option);
            })

            return items;
        }

        if (e.code.match(/BracketLeft|BracketRight|Semicolon|Quote|Comma|Period|Key+/g))
        {
            let currentKey  = this.filteredOptions[this.currentIndex].name.charAt(0).toLowerCase();
            let firstOption = options()[0];
            let lastOption  = options()[options().length - 1];

            this.selectedByArrow = true;

            for (let i = this.currentIndex; i < this.filteredOptions.length; i++)
            {
                let option = this.filteredOptions[i];
                let name   = option.name.toLowerCase();

                if (key != currentKey)
                {
                    if (options().length)
                        this.selectOption(firstOption);

                    break;
                }

                if (name.startsWith(key))
                {
                    if (lastOption == this.filteredOptions[this.currentIndex])
                    {
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
    }

    searchableActions(e)
    {
        if (e.code.match(/Digit|Backspace|Minus|Key+/g) && !e.altKey)
        {
            this.selectedByArrow = false;

            if (!this.open)
                this.toggleDropdown();
        }
        else if (e.code.match(/BracketLeft|BracketRight|Semicolon|Quote|Comma|Period|Key+/g) && e.altKey)
        {
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
    }

    moveUp()
    {
        if (!this.open)
        {
            this.toggleDropdown();
            return;
        }

        this.selectedByArrow = true;

        for (let i = this.currentIndex - 1; i >= 0; i--)
        {
            if (this.preSetOption(this.filteredOptions[i]))
            {
                this.currentIndex = i;
                break;
            }
        }
    }

    moveDown()
    {
        if (!this.open)
        {
            this.toggleDropdown();
            return;
        }

        this.selectedByArrow = true;

        for (let i = this.currentIndex + 1; i < this.filteredOptions.length; i++)
        {
            if (this.preSetOption(this.filteredOptions[i]))
            {
                this.currentIndex = i;
                break;
            }
        }
    }

    normalizeOptions()
    {
        let options    = this.options;
        let newOptions = [];
        if (!options.length)
        {
            this.newOptions = [];
            return;
        }

        let isNonObjectArray = typeof options[0] == "string";
        for (let prop in options)
        {
            let isParent = options[prop][this.isParentField];
            newOptions.push({
                'id': isNonObjectArray ? options[prop] : options[prop][this.valueField],
                'name': isNonObjectArray ? options[prop] : options[prop][this.textField],
                'searchHint': isNonObjectArray ? options[prop] : options[prop][this.valueSearchHint],
                'level': options[prop][this.levelField],
                'isParent': typeof isParent == "undefined" ? false : isParent,
            });
        }

        this.newOptions = newOptions;
    }

    toggleDropdown(event = null)
    {
        let searchInputEl = this.$refs.searchInput as HTMLElement;

        if (event && event.target === searchInputEl)
            return;

        if (this.open)
        {
            this.exit();
            return;
        }

        this.open        = true;
        this.searchInput = '';

        let dropdown  = this.$refs.dropdown as HTMLElement;
        let pos       = dropdown.getBoundingClientRect();

        this.selectHeight = dropdown.clientHeight;

        this.$nextTick(() =>
        {
            if (this.searchable)
                searchInputEl.focus();

            let elementId = Math.random().toString(16).slice(2);

            let dropdownBox = this.$refs.dropdownBox as HTMLElement;

            if (this.elementHeight == 0)
                this.elementHeight = dropdownBox.clientHeight;

            let scrollY = window.scrollY || window.pageYOffset;
            let scrollX = window.scrollX || window.pageXOffset;

            dropdownBox.id          = elementId;
            dropdownBox.style.top   = this.isBottom(pos) ?
                (scrollY + pos.top - this.elementHeight) + "px" : (scrollY + pos.top + pos.height) + "px";
            dropdownBox.style.left  = (scrollX + pos.left) + "px";

            if (this.itemSize == ItemSizeClass.FullWidth)
                dropdownBox.style.minWidth = pos.width + "px";
            else
                dropdownBox.style.width = pos.width + "px";

            this.currentElementId = elementId;

            this.setOption(this.getSelectedOption());

            document.body.appendChild(dropdownBox);

            this.adjustScroll();
        });
    }

    exit()
    {
        if (!this.open)
            return;

        this.searchInput = '';
        this.open        = false;

        this.$emit('input', this.selected.id);

        let dropdownBox   = this.$refs.dropdownBox as HTMLElement;
        let dropdownLabel = this.$refs.dropdownLabel as HTMLElement;

        dropdownLabel.focus();
        dropdownBox.remove();
    }

    updateDropdownPosition()
    {
        let dropdownBox = this.$refs.dropdownBox as HTMLElement;
        if (!dropdownBox)
            return;

        let el             = document.getElementById(this.currentElementId);
        let dropdown       = this.$refs.dropdown as HTMLElement;
        let pos            = dropdown.getBoundingClientRect();
        this.elementHeight = dropdownBox.clientHeight;

        let scrollY = window.scrollY || window.pageYOffset;
        let scrollX = window.scrollX || window.pageXOffset;

        el.style.top   = this.isBottom(pos) ?
            (scrollY + pos.top - this.elementHeight) + "px" : (scrollY + pos.top + pos.height) + "px";
        el.style.left  = (scrollX + pos.left) + "px";

        if (this.itemSize == ItemSizeClass.FullWidth)
            el.style.minWidth = pos.width + "px";
        else
            el.style.width = pos.width + "px";

        this.adjustScroll();
    }

    updateIndex()
    {
        this.filteredOptions.forEach((option) =>
        {
            if (this.preSelected.id == option.id)
            {
                this.currentIndex = this.filteredOptions.indexOf(option);
                return;
            }
        });
    }

    adjustScroll()
    {
        let dropdownList = this.$refs.dropdownList as HTMLElement;

        const optionEl = dropdownList?.children[this.currentIndex] as HTMLElement || false;

        if (!optionEl)
            return;

        const bounds                = this.getDropdownViewport();
        const {top, bottom, height} = optionEl.getBoundingClientRect();

        if (top < bounds.top)
            return (dropdownList.scrollTop = optionEl.offsetTop);
        else if (bottom > bounds.bottom)
            return (dropdownList.scrollTop = optionEl.offsetTop - (bounds.height - height));
    }

    getDropdownViewport()
    {
        let dropdownList = this.$refs.dropdownList as HTMLElement;

        return dropdownList ? dropdownList.getBoundingClientRect() : {height: 0, top: 0, bottom: 0};
    }

    scrollOutside()
    {
        this.updateDropdownPosition();

        this.$nextTick(() => {
            let el = document.getElementById(this.currentElementId);

            if (!this.isInViewport(el) && !this.isMobile())
                this.exit();
        });
    }

    isInViewport(el)
    {
        const rect = el.getBoundingClientRect();

        return !(
            ((rect.top + el.clientHeight + this.selectHeight) < 0) ||
            (rect.top - this.selectHeight) > window.innerHeight
        );
    }

    isMobile()
    {
        return screen.width < this.mobileScreen;
    }

    isBottom(pos)
    {
        this.isDropdownBottom = window.innerHeight - this.elementHeight < pos.bottom;
        return this.isDropdownBottom;
    }

    reset()
    {
        this.selected = {};
        this.placeholder = null;
    }

    deepCopy(initialObject: any, replacer = null): any
    {
        if (!initialObject)
            return null;
        return JSON.parse(JSON.stringify(initialObject, replacer));
    }
}
