/** @odoo-module **/

/** @odoo-module */ 
/** @odoo-module **/
/** @odoo-module **/



import { registry } from "@web/core/registry";
import { Component, useState, onMounted, useExternalListener,onWillStart,useListener } from "@odoo/owl";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { useService } from "@web/core/utils/hooks";
import { _t } from "@web/core/l10n/translation";
import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";
import { TextAreaPopup } from "@point_of_sale/app/utils/input_popups/textarea_popup";
import { Navbar } from "@point_of_sale/app/navbar/navbar";
import { patch } from "@web/core/utils/patch";
// import { FiscalReadingPopup } from "./FiscalReadingPopup/FiscalReadingPopup";
import { jsonrpc } from "@web/core/network/rpc_service";
import { AbstractAwaitablePopup } from "@point_of_sale/app/popup/abstract_awaitable_popup";
import { ControlButtonsMixin } from "@point_of_sale/app/utils/control_buttons_mixin";
import { useBarcodeReader } from "@point_of_sale/app/barcode/barcode_reader_hook";
import { parseFloat } from "@web/views/fields/parsers";
import { NumberPopup } from "@point_of_sale/app/utils/input_popups/number_popup";
import { ErrorPopup } from "@point_of_sale/app/errors/popups/error_popup";
import { ControlButtonPopup } from "@point_of_sale/app/screens/product_screen/control_buttons/control_buttons_popup";
import { ConnectionLostError } from "@web/core/network/rpc_service";
import { ErrorBarcodePopup } from "@point_of_sale/app/barcode/error_popup/barcode_error_popup";
import { Numpad } from "@point_of_sale/app/generic_components/numpad/numpad";
import { ProductsWidget } from "@point_of_sale/app/screens/product_screen/product_list/product_list";
import { ActionpadWidget } from "@point_of_sale/app/screens/product_screen/action_pad/action_pad";
import { Orderline } from "@point_of_sale/app/generic_components/orderline/orderline";
import { OrderWidget } from "@point_of_sale/app/generic_components/order_widget/order_widget";
// import { jsonrpc } from "@web/core/network/rpc_service";

// import { Component, hooks } from "@odoo/owl";
import { posBusService } from "@point_of_sale/app/bus/pos_bus_service";
// const { useState, onMounted, onWillStart, useExternalListener, useListener } = hooks;
// import { Component, useState } from "@odoo/owl";


// to send messages to the posbus 

// this.env.services.posBus.dispatch({
//     type: 'setloading',
//     payload: true,
// });

import { Chrome } from "@point_of_sale/app/pos_app";


import { debounce } from "@web/core/utils/timing";



import { hooks } from '@odoo/owl';

    // const Chrome = require('point_of_sale.Chrome');
    // const Registries = require('point_of_sale.Registries');

   export const ZmallChrome = (Chrome) =>
        class extends Chrome {
            constructor() {
                super(...arguments);
                console.log("ZmallChrome");


            }
        }
    // registry.category("pos_screens").add("ZmallChrome", ZmallChrome);
    // registry.Component.extend(Chrome,ZmallChrome);
    // const componentRegistry = registry.category("main_components");
    // componentRegistry.add(Chrome,ZmallChrome);
    // componentRegistry.add('ZmallChrome',ZmallChrome);


    
    
    // Registries.Component.extend(Chrome, ZmallChrome);


// /** @odoo-module */

// import { Chrome } from "@point_of_sale/app/pos_app";
// import { patch } from "@web/core/utils/patch";

// patch(Chrome.prototype, {
//     get showCashMoveButton() {
//         const { cashier } = this.pos;
//         return super.showCashMoveButton && (!cashier || cashier.role == "manager");
//     },
// });



// /** @odoo-module */

// import { Chrome } from "@point_of_sale/app/pos_app";
// import { patch } from "@web/core/utils/patch";
// import { ClosePosPopup } from "@point_of_sale/app/navbar/closing_popup/closing_popup";
// import { onMounted } from "@odoo/owl";

// patch(Chrome.prototype, {
//     setup() {
//         super.setup(...arguments);
//         onMounted(async () => {
//             if (this.pos.is_french_country() && this.pos.pos_session.start_at) {
//                 const now = Date.now();
//                 const limitDate = new Date(this.pos.pos_session.start_at);
//                 limitDate.setDate(limitDate.getDate() + 1);
//                 if (limitDate.getTime() < now) {
//                     const info = await this.pos.getClosePosInfo();
//                     this.popup.add(ClosePosPopup, { ...info, keepBehind: true });
//                 }
//             }
//         });
//     },
// });

