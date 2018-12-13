class tableBuilder {
    constructor() {
        this.maxRows = 50;
    }

    build() {
        if (this.maxRows && this.list.length > this.maxRows)
            return false;
        let $table = $('<table/>').addClass("table").attr("border", 1);
        let columns = this.addHeaders($table);

        for (let i = 0; i < this.list.length; i++) {
            let $row = $('<tr/>');
            if (this.list[i]["id"]) {
                $row.attr("data-id", this.list[i]["id"]);
            }
            for (let colIndex = 0; colIndex < columns.length; colIndex++) {
                $row.append($('<td/>').html(this.list[i][columns[colIndex]] || ""));
            }
            $table.append($row);
        }

        return $table;
    }

    addHeaders($table) {
        let columnSet = [];
        let $headerTr = $('<tr/>');
        for (let i = 0; i < this.list.length; i++) {
            for (let key in this.list[i]) {
                if ($.inArray(key, columnSet) == -1) {
                    columnSet.push(key);
                    $headerTr.append($('<th/>').attr("data-sort", key).html(key));
                }
            }
        }
        $table.append($headerTr);
        return columnSet;
    }

}

class paginationBuilder {
    constructor() {
        this.showArrows = true;
    }

    pageNumbers(current, last) {
        let delta = 2,
                range = [],
                rangeWithDots = [],
                l;
        for (let i = 1; i <= last; i++) {
            if (i == 1 || i == last || i >= current - delta && i < current + delta) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    }

    build(current, last) {
        return current && last ? $("<nav/>").append($("<ul/>").addClass("pagination").append(
                this.showArrows ? $("<li/>").addClass("prev").append(() => (current != 1 ? $("<a/>").attr({href: "#"}) : $("<span/>")).html("Назад")) : null,
                this.pageNumbers(current, last).map(number => $("<li/>").addClass("page").addClass(number == current ? "active" : null).append(() => (typeof number == "number" && number != current ? $("<a/>").attr({href: "#", "data-page": number}) : $("<span/>")).html(number))),
                this.showArrows ? $("<li/>").addClass("next").append(() => (current != last ? $("<a/>").attr({href: "#"}) : $("<span/>")).html("Вперед")) : null
                )) : false;
    }

}

class preloader {

    constructor($el) {
        let self = this;
        if (!$el.length)
            return;
        self.$el = $el;
        self.$el.prepend($("<div/>").addClass("loader-wrapper").append($("<div/>").addClass("loader-inner").append($("<div/>").addClass("loader"))));
    }

    show() {
        let self = this;
        let zoom = 120 / parseInt(self.$el.css("height"));
        self.$el.find(".loader-wrapper .loader").css({zoom: zoom > 0.6 ? (120 * 0.6 / parseInt(this.$el.css("height"))).toFixed(1) : ""})
        self.$el.css({position: "relative"}).removeClass("removing-loader").addClass("has-loader");
        self.$el.find(".loader-wrapper").stop(true, true).fadeIn(200);
    }

    hide() {
        let self = this;
        self.$el.removeClass("has-loader").addClass("removing-loader");
        self.$el.find(".loader-wrapper").stop(true, true).fadeOut(200, function () {
            self.$el.removeClass("removing-loader");
        });
    }

}

class helper {

    static getSpecificProps(row, props) {
        return Object.keys(row).filter(key => props.includes(key)).reduce((obj, key) => {
            obj[key] = row[key];
            return obj;
        }, {});
    }

    static objectifyForm($form) {
        let formArray = $form.serializeArray();
        let returnArray = {};
        for (let i = 0; i < formArray.length; i++) {
            returnArray[formArray[i]['name']] = formArray[i]['value'];
        }
        return returnArray;
    }

    static get(url) {
        // Возвращаем новое Обещание.
        return new Promise(function (resolve, reject) {
            // Делаем привычные XHR вещи
            var req = new XMLHttpRequest();
            req.open('GET', url);

            req.onload = function () {
                // Этот кусок вызовется даже при 404’ой ошибке
                // поэтому проверяем статусы ответа
                if (req.status == 200) {
                    // Завершаем Обещание с текстом ответа
                    resolve(req.response);
                } else {
                    // Обламываемся, и передаём статус ошибки
                    // что бы облегчить отладку и поддержку
                    reject(Error(req.statusText));
                }
            };

            // отлавливаем ошибки сети
            req.onerror = function () {
                reject(Error("Network Error"));
            };

            // Делаем запрос
            req.send();
        });
    }

}

class personList {

    constructor($wrapper) {
        if (!$wrapper.length)
            return;
        let self = this;
        self.infoDetail = {
            selectedUser: {name: "Выбранный пользователь"},
            description: {name: "Описание", type: "textarea"},
            streetAddress: {name: "Адрес проживания"},
            city: {name: "Город"},
            state: {name: "Провинция/штат"},
            zip: {name: "Индекс"},
        };
        self.dataUrl = {
            local: "persons.json",
            small: "http://www.filltext.com/?rows=32&id=%7Bnumber%7C1000%7D&firstName=%7BfirstName%7D&lastName=%7BlastName%7D&email=%7Bemail%7D&phone=%7Bphone%7C(xxx)xxx-xx-xx%7D&adress=%7BaddressObject%7D&description=%7Blorem%7C32%7D",
            large: "http://www.filltext.com/?rows=1000&id={number|1000}&firstName={firstName}&delay=3&lastName={lastName}&email={email}&phone={phone|(xxx)xxx-xx-xx}&adress={addressObject}&description={lorem|32}",
        };
        self.$wrapper = $wrapper;
        self.sort = {};
        self.filter = {};

        self.$table = self.$wrapper.find(".personTable");
        self.$pagination = self.$wrapper.find(".personPagination");
        self.$detail = self.$wrapper.find(".personDetail");
        self.$filterForm = self.$wrapper.find(".filterForm");
        self.preloader = new preloader(self.$wrapper);
        self.tableBuilder = new tableBuilder();
        self.paginationBuilder = new paginationBuilder();
        //self.paginationBuilder.showArrows=false;

        $(document, self.$wrapper).on("click", ".pagination .prev", function (e) {
            e.preventDefault();
            self.prevPage();
        });

        $(document, self.$wrapper).on("click", ".pagination .next", function (e) {
            e.preventDefault();
            self.nextPage();
        });

        $(document, self.$wrapper).on("click", ".pagination .page > a", function (e) {
            e.preventDefault();
            self.setPage($(this).data("page"));
        });

        $(document, self.$table).on("click", "tr[data-id]", function () {
            let id = $(this).data("id");
            if (self.selectedPerson == id) {
                self.selectedPerson = null;
                self.hideDetailPerson();
            } else {
                self.selectedPerson = id;
                self.showDetailPerson();
            }
        });

        $(document, self.$wrapper).on("change", "select.onPage", function () {
            let offset = self.page * self.limit - self.limit;
            self.limit = $(this).val();
            self.page = Math.ceil(offset / self.limit) || 1;
            self.update();
        });

        $(document, self.$table).on("click", "th[data-sort]", function () {
            self.sortKey = $(this).data("sort");
            self.triggerSortOrder();
            self.sortList();
        });

        $(document, self.$wrapper).on("click", ".refresh", function (e) {
            e.preventDefault();
            self.setPersonList();
        });

        $(document, self.$wrapper).on("submit", self.$filterForm, function (e) {
            e.preventDefault();
            self.filter = helper.objectifyForm(self.$filterForm);
            self.update();
        });

        $(document, self.$filterForm).on("click", "button.reset-button", function (e) {
            e.preventDefault();
            self.$filterForm[0].reset();
            self.$filterForm.trigger("submit");
        });

        $(document, self.$wrapper).on("change", "select.dataSet", function (e) {
            e.preventDefault();
            self.dataSet = $(this).val();
        });
    }

    showDetailPerson() {
        let self = this;

        self.$table.find("tr").removeClass("active");
        self.$table.find("tr[data-id=" + self.selectedPerson + "]").addClass("active");

        let persons = self.currentList.filter(person => person.id == self.selectedPerson);

        let $rows = [];
        for (let person of persons) {

            let personTmp = Object.assign({
                selectedUser: [person.firstName, person.lastName].filter(s => s).join(" "),
                description: person.description
            }, helper.getSpecificProps(person.adress, ['streetAddress', 'city', 'state', 'zip']));
            let $row = $("<dl/>");
            Object.keys(personTmp).map(key => {
                let value = personTmp[key];
                let info = self.infoDetail[key];
                let $dt = $("<dt/>").addClass("col-sm-3").html(info.name);
                let $dd = $("<dd/>").addClass("col-sm-9").html(info.type == "textarea" ? $("<textarea />").val(value) : value);
                $row.append($dt, $dd);
            });
            if ($rows.length > 0) {
                $rows.push($("<div/>").addClass("col-xs-12").append($("<hr/>")));
            }
            $rows.push($row);
        }

        self.$detail.empty().html($("<div/>").addClass("person-inner m-b-md").append($("<div/>").addClass("row").append($rows)));

    }

    hideDetailPerson() {
        let self = this;
        self.$table.find("tr").removeClass("active");
        self.$detail.empty();
    }

    triggerSortOrder() {
        let self = this;
        let order = self.sort[self.sortKey];
        self.sort[self.sortKey] = order && order == "asc" ? "desc" : "asc";
    }

    setPersonList() {
        let self = this;
        self.selectedPerson = null;
        let url = self.getUrl();
        if (!url)
            return;
        self.preloader.show();

        helper.get(url).then(response => JSON.parse(response), error => {
            alert("Произошла ошибка: " + error);
            self.preloader.hide();
        }).then(function (data) {
            if ("error" in data[0]) {
                alert("Произошла ошибка: " + data[0].error);
            } else {
                self.$filterForm[0].reset();
                self.filter = {};
                self.persons = data;
                self.sortList(false);
                self.update();
                self.preloader.hide();
            }
        });

    }

    getUrl() {
        let self = this;
        return self.dataUrl[self.dataSet] || null;
    }

    sortList(update = true) {
        let self = this;
        if (!self.sortKey)
            return;
        let order = self.sort[self.sortKey];

        self.persons.sort(function (a, b) {
            if (order == "desc") {
                [a, b] = [b, a];
            }
            let val1 = typeof a[self.sortKey] == "string" ? a[self.sortKey].toLowerCase() : a[self.sortKey];
            let val2 = typeof b[self.sortKey] == "string" ? b[self.sortKey].toLowerCase() : b[self.sortKey];
            return val2 < val1 ? 1 : val1 < val2 ? -1 : 0;
        });
        if (update)
            self.update();
    }

    update() {
        let self = this;

        self.personsFiltered = self.persons.filter(person => {
            let conditions = Object.keys(self.filter).map(key => !self.filter[key] || ((value) => typeof person[key] == "number" ? person[key] == value : person[key].toLowerCase().indexOf(value.toLowerCase()) != -1)(self.filter[key]));
            return conditions.filter(c => c).length == conditions.length;
        });

        if (self.page * self.limit - self.limit > self.personsFiltered.length)
            self.page = 1;

        self.currentList = self.personsFiltered.slice(self.page * self.limit - self.limit, self.page * self.limit)
        self.tableBuilder.list = self.currentList.map(row => helper.getSpecificProps(row, ['id', 'firstName', 'lastName', 'email', 'phone']));

        self.currentList.filter(row => row.id == self.selectedPerson).length > 0 ? self.showDetailPerson() : self.hideDetailPerson();

        self.$table.empty().html(self.tableBuilder.build());
        self.$table.find("tr:eq(0)").find("th:eq(0),td:eq(0)").css({width: "10%"});
        self.$table.find("tr:eq(0)").find("th:gt(0),td:eq(0)").css({width: (90 / (self.$table.find("tr:eq(0) > th").length - 1)).toString() + "%"});

        self.$pagination.empty().html(self.paginationBuilder.build(self.page, self.getTotalPages()));

        self.$table.find("th[data-sort] .sort").remove();
        self.$table.find("th[data-sort='" + self.sortKey + "']").append($("<span/>").addClass("sort").html(self.sort[self.sortKey] == "asc" ? "↑" : "↓"));
    }

    setPage(page = 1) {
        let totalPages = this.getTotalPages();
        if (this.page == page)
            return;
        this.page = page;
        if (this.page < 1)
            this.page = 1;
        if (this.page > totalPages)
            this.page = totalPages;
        this.update();
    }

    prevPage() {
        if (this.page == 1)
            return;
        this.setPage(this.page - 1);
    }

    nextPage() {
        if (this.page == this.getTotalPages())
            return;
        this.setPage(this.page + 1);
    }

    getTotalPages() {
        return Math.ceil(this.personsFiltered.length / this.limit);
    }

    init() {
        var self = this;
        self.sortKey = "firstName";
        self.dataSet = self.$wrapper.find("select.dataSet").val() || "small";
        self.limit = self.$wrapper.find("select.onPage").val() || 10;
        self.page = 1;
        self.triggerSortOrder();
        self.setPersonList();
    }

}

$(function () {
    let list = new personList($("#personListWrapper"));
    list.init();
});
