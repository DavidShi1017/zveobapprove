sap.ui.define([], function () {
    "use strict";

    return {
        /**
         * Show the OLD value when the field is flagged as changed (ChgX), otherwise the current value.
         * For a CREATE request every ChgX is false/empty, so the current value is shown.
         */
        diffOrCurrent: function (chgFlag, oldValue, currentValue) {
            return chgFlag ? oldValue : currentValue;
        },

        /**
         * The "Requested Changes" panel only makes sense for UPDATE requests (old vs new).
         * CREATE requests have nothing to compare, so hide the panel.
         */
        isUpdateRequest: function (requestType) {
            return requestType === "UPDATE";
        }
    };
});
