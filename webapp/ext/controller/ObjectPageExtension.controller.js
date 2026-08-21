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

    return ControllerExtension.extend("zveobapprove.ext.controller.ObjectPageExtension", {
        override: {
            onInit: function () {
                var oView = this.getView();
                oView.addEventDelegate({
                    onAfterRendering: this._formatCommentDates.bind(this)
                });
            }
        },

        _formatCommentDates: function () {
            var oView = this.getView();
            var aControls = oView.findAggregatedObjects(true, function (oControl) {
                var oContext = oControl.getBindingContext && oControl.getBindingContext();
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
                if (oControl.data("commentDateFormatted")) {
                    return;
                }

                var oContext = oControl.getBindingContext && oControl.getBindingContext();
                if (oContext && oContext.getProperty("Timestamp") !== undefined) {
                    var sDate = formatCommentDate(oContext.getProperty("Timestamp"));
                    if (oControl.setNumber) {
                        oControl.setNumber(sDate);
                    } else {
                        oControl.setText(sDate);
                    }
                    oControl.data("commentDateFormatted", true);
                    return;
                }

                var sProperty = oControl.setNumber ? "number" : "text";
                oControl.bindProperty(sProperty, {
                    parts: [{ path: "Timestamp" }],
                    formatter: formatCommentDate
                });
                oControl.data("commentDateFormatted", true);
            });
        }
    });
});
