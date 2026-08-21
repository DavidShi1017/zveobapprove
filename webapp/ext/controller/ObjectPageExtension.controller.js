sap.ui.define(["sap/ui/core/mvc/ControllerExtension"], function (ControllerExtension) {
    "use strict";

    function formatCommentDate(value) {
        if (value === null || value === undefined || value === "") {
            return "";
        }

        var sValue = String(value);
        var digits = sValue.split(".")[0];
        var match = digits.match(/^(\d{4})(\d{2})(\d{2})/);
        var oDate;

        if (match) {
            oDate = new Date(Date.UTC(
                Number(match[1]),
                Number(match[2]) - 1,
                Number(match[3])
            ));
        } else if (!isNaN(Number(value)) && Number(value) > 0 && Number(value) < 100000) {
            oDate = new Date(Date.UTC(1899, 11, 30) + Number(value) * 86400000);
        } else {
            return sValue;
        }

        return String(oDate.getUTCDate()).padStart(2, "0") + "/" +
            String(oDate.getUTCMonth() + 1).padStart(2, "0") + "/" +
            oDate.getUTCFullYear();
    }

    function getTimestampContext(oControl) {
        var oCurrent = oControl;
        while (oCurrent) {
            var oContext = oCurrent.getBindingContext && oCurrent.getBindingContext();
            if (oContext && oContext.getProperty("Timestamp") !== undefined) {
                return oContext;
            }
            oCurrent = oCurrent.getParent && oCurrent.getParent();
        }
        return null;
    }

    function formatRenderedDate(oControl) {
        var sValue = oControl.getNumber ? oControl.getNumber() : oControl.getText();
        if (!sValue || !/[\d,]+\.\d+/.test(String(sValue))) {
            return;
        }

        var sDate = formatCommentDate(String(sValue).replace(/,/g, ""));
        if (oControl.setNumber) {
            oControl.unbindProperty("number");
            oControl.setNumber(sDate);
        } else if (oControl.setText) {
            oControl.unbindProperty("text");
            oControl.setText(sDate);
        }
    }

    return ControllerExtension.extend("zveobapprove.ext.controller.ObjectPageExtension", {
        override: {
            onInit: function () {
                var oView = this.getView();
                oView.addEventDelegate({
                    onAfterRendering: this._formatTables.bind(this)
                });
                setTimeout(this._formatTables.bind(this), 300);
                setTimeout(this._formatTables.bind(this), 1000);
            }
        },

        _formatTables: function () {
            this._formatCommentDates();
            this._formatDateColumns();
        },

        _formatDateColumns: function () {
            var oView = this.getView();
            var aTables = oView.findAggregatedObjects(true, function (oControl) {
                return oControl.getColumns && oControl.getItems && oControl.getItems().length;
            });

            aTables.forEach(function (oTable) {
                var aColumns = oTable.getColumns();
                var aDateIndexes = [];

                aColumns.forEach(function (oColumn, iIndex) {
                    var oHeader = oColumn.getHeader && oColumn.getHeader();
                    var sHeader = oHeader && oHeader.getText && oHeader.getText();
                    if (sHeader === "Date" || sHeader === "Timestamp") {
                        aDateIndexes.push(iIndex);
                    }
                });

                if (!aDateIndexes.length) {
                    return;
                }

                if (!oTable.data("dateColumnRefreshAttached") && oTable.attachUpdateFinished) {
                    oTable.attachUpdateFinished(this._formatDateColumns.bind(this));
                    oTable.data("dateColumnRefreshAttached", true);
                }

                oTable.getItems().forEach(function (oItem) {
                    var aCells = oItem.getCells && oItem.getCells();
                    aDateIndexes.forEach(function (iIndex) {
                        if (aCells && aCells[iIndex]) {
                            formatRenderedDate(aCells[iIndex]);
                        }
                    });
                });
            }.bind(this));
        },

        _formatCommentDates: function () {
            var oView = this.getView();
            var aControls = oView.findAggregatedObjects(true, function (oControl) {
                var oContext = getTimestampContext(oControl);
                if (oContext && oContext.getProperty("Timestamp") !== undefined &&
                    (oControl.setText || oControl.setNumber)) {
                    return true;
                }

                var oBindingInfo = oControl.getBindingInfo && oControl.getBindingInfo("text");
                var oNumberBindingInfo = oControl.getBindingInfo && oControl.getBindingInfo("number");
                return (oBindingInfo && oBindingInfo.parts && oBindingInfo.parts.some(function (oPart) {
                    return oPart.path === "Timestamp";
                })) || (oNumberBindingInfo && oNumberBindingInfo.parts && oNumberBindingInfo.parts.some(function (oPart) {
                    return oPart.path === "Timestamp";
                }));
            });

            aControls.forEach(function (oControl) {
                var oContext = getTimestampContext(oControl);
                if (oContext) {
                    var sTimestamp = String(oContext.getProperty("Timestamp"));
                    if (oControl.data("commentDateValue") === sTimestamp) {
                        return;
                    }

                    var sDate = formatCommentDate(oContext.getProperty("Timestamp"));
                    if (oControl.setNumber) {
                        if (oControl.isBound && oControl.isBound("number")) {
                            oControl.unbindProperty("number");
                        }
                        oControl.setNumber(sDate);
                    } else {
                        if (oControl.isBound && oControl.isBound("text")) {
                            oControl.unbindProperty("text");
                        }
                        oControl.setText(sDate);
                    }
                    oControl.data("commentDateValue", sTimestamp);
                    return;
                }

                var sProperty = oControl.setNumber ? "number" : "text";
                oControl.bindProperty(sProperty, {
                    parts: [{ path: "Timestamp" }],
                    formatter: formatCommentDate
                });
            });
        }
    });
});
