sap.ui.define(["sap/ui/core/mvc/ControllerExtension"], function (ControllerExtension) {
    "use strict";

    function formatCommentDate(value) {
        if (value === null || value === undefined || value === "") {
            return "";
        }

        var digits = String(value).split(".")[0];
        var match = digits.match(/^(\d{4})(\d{2})(\d{2})/);
        if (!match) {
            return String(value);
        }

        return match[3] + "/" + match[2] + "/" + match[1];
    }

    return ControllerExtension.extend("zveobapprove.ext.controller.ObjectPageExtension", {
        override: {
            onInit: function () {
                var oView = this.base.getExtensionAPI().getView();
                oView.addEventDelegate({
                    onAfterRendering: this._formatCommentDates.bind(this)
                });
            }
        },

        _formatCommentDates: function () {
            var oView = this.base.getExtensionAPI().getView();
            var aControls = oView.findAggregatedObjects(true, function (oControl) {
                var oBindingInfo = oControl.getBindingInfo && oControl.getBindingInfo("text");
                return oBindingInfo && oBindingInfo.parts && oBindingInfo.parts.some(function (oPart) {
                    return oPart.path === "Timestamp";
                });
            });

            aControls.forEach(function (oControl) {
                if (oControl.data("commentDateFormatted")) {
                    return;
                }

                oControl.bindProperty("text", {
                    parts: [{ path: "Timestamp" }],
                    formatter: formatCommentDate
                });
                oControl.data("commentDateFormatted", true);
            });
        }
    });
});
