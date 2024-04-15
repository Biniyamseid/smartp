/** @odoo-module **/
import { registry } from "@web/core/registry";
import { Component } from "@odoo/owl";
import { usePos } from "@point_of_sale/app/store/pos_hook";

export class DeliveryScreenWidget extends Component {
    static template = "point_of_sale.DeliveryScreenWidget";
    static props = {};

    setup() {
        super.setup();
        this.pos = usePos();
    }

    async onClick() {
        try {
            const { confirmed, payload: result } = await this.pos.showTempScreen('DeliveryOrdersScreen', {move: null});
            if (confirmed) {
                // Handle confirmed action here
                debugger; // Consider removing debugger for production code
            }
        } catch (error) {
            console.error("Error in onClick:", error);
        }
    }

    get isHidden() {
        return !(this.env?.pos?.config?.management_invoice);
    }

    get count() {
        try {
            let zmalllive = JSON.parse(window.localStorage.getItem("livedata"));
            return zmalllive ? zmalllive.length : 0;
        } catch (error) {
            console.error("Error parsing livedata from localStorage:", error);
            return 0;
        }
    }
}

registry.category("pos_screens").add("DeliveryScreenWidget", DeliveryScreenWidget);


// import { registry } from "@web/core/registry";
// import { useService } from "@web/core/utils/hooks";
// import { usePos } from "@point_of_sale/app/store/pos_hook";
// import { Component } from "@odoo/owl";

// export class DeliveryScreenWidget extends Component {
//     static template = "point_of_sale.DeliveryScreenWidget";
//         // constructor() {
//         //     console.log("DeliveryScreenWidget");
//         //     super(...arguments);
            
//         // }
//         static props = {}
//         setup(){
//             this.pos = usePos();
//             super.setup(... arguments);
//         }

//         async onClick() {
//             const { confirmed, payload: result } = await this.pos.showTempScreen(
//                 'DeliveryOrdersScreen',
//                 {
//                     move: null,
//                 }
//             );
//             if (confirmed) {
//                 debugger
//             }
//         }

//         // mounted() {
//         //     console.log("DeliveryScreenWidget");
//         //     posbus.on('reload-orders', this, this.render);
//         // }

//         // willUnmount() {
//         //     posbus.off('reload-orders', this, null);
//         // }

//         get isHidden() {
//             if (!this.env || !this.env.pos || !this.env.pos.config || (this.env && this.env.pos && this.env.pos.config && !this.env.pos.config.management_invoice)) {
//                 return true
//             } else {
//                 return false
//             }
//         }

//         get count() {
//             let zmalllive = JSON.parse(window.localStorage.getItem("livedata"))
//             if(zmalllive != undefined){
//                 return zmalllive.length;
//             }
//             else{
//                 return 0;
//             }
//         }
//     }

//     // DeliveryScreenWidget.template = 'DeliveryScreenWidget';

//     // registry.add(DeliveryScreenWidget);
//     // registry.category("pos_screens").add("DeliveryScreenWidget", DeliveryScreenWidget);
//     registry.category("pos_screens").add("DeliveryScreenWidget", DeliveryScreenWidget);
//     registry.category("pos_screens").add("DeliveryScreenWidget", {
//     component: DeliveryScreenWidget,
// });



// export class OpenMoveWidget extends Component {
//     static props = { };

//     setup() {
//         super.setup();
//         this.action = useService("action");
//     }

//     async openMove(ev) {
//         this.action.doActionButton({
//             type: "object",
//             resId: this.props.record.resId,
//             name: "action_open_business_doc",
//             resModel: "account.move.line",
//         });
//     }
// }

// OpenMoveWidget.template = "account.OpenMoveWidget";
// registry.category("fields").add("open_move_widget", {
//     component: OpenMoveWidget,
// });


// import { _t } from "@web/core/l10n/translation";
// import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";
// import { useService } from "@web/core/utils/hooks";
// import { TextAreaPopup } from "@point_of_sale/app/utils/input_popups/textarea_popup";
// import { Component } from "@odoo/owl";
// import { usePos } from "@point_of_sale/app/store/pos_hook";

// import { usePos } from "@point_of_sale/app/store/pos_hook";
// import { Component, useState } from "@odoo/owl";
// import { useService } from "@web/core/utils/hooks";

// import { _t } from "@web/core/l10n/translation";
// import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";
// import { useService } from "@web/core/utils/hooks";
// import { TextAreaPopup } from "@point_of_sale/app/utils/input_popups/textarea_popup";
// import { Component } from "@odoo/owl";
// import { usePos } from "@point_of_sale/app/store/pos_hook";

// import { usePos } from "@point_of_sale/app/store/pos_hook";
// import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";
// import { Component } from "@odoo/owl";

// import { Navbar } from "@point_of_sale/app/navbar/navbar";
// import { patch } from "@web/core/utils/patch";
// import { _t } from "@web/core/l10n/translation";
// import { FiscalReadingPopup } from "./FiscalReadingPopup/FiscalReadingPopup";
// import { jsonrpc } from "@web/core/network/rpc_service";

// import { AbstractAwaitablePopup } from "@point_of_sale/app/popup/abstract_awaitable_popup";
// import { _t } from "@web/core/l10n/translation";

// import { registry } from "@web/core/registry";
// import { createElement, append } from "@web/core/utils/xml";
// import { Notebook } from "@web/core/notebook/notebook";
// import { formView } from "@web/views/form/form_view";
// import { FormCompiler } from "@web/views/form/form_compiler";
// import { FormRenderer } from "@web/views/form/form_renderer";
// import { FormController } from '@web/views/form/form_controller';
// import { useService } from "@web/core/utils/hooks";/** @odoo-module */

// import { ControlButtonsMixin } from "@point_of_sale/app/utils/control_buttons_mixin";
// import { registry } from "@web/core/registry";
// import { useService } from "@web/core/utils/hooks";
// import { useBarcodeReader } from "@point_of_sale/app/barcode/barcode_reader_hook";
// import { parseFloat } from "@web/views/fields/parsers";
// import { _t } from "@web/core/l10n/translation";

// import { NumberPopup } from "@point_of_sale/app/utils/input_popups/number_popup";
// import { ErrorPopup } from "@point_of_sale/app/errors/popups/error_popup";
// import { ControlButtonPopup } from "@point_of_sale/app/screens/product_screen/control_buttons/control_buttons_popup";
// import { ConnectionLostError } from "@web/core/network/rpc_service";

// import { usePos } from "@point_of_sale/app/store/pos_hook";
// import { Component, onMounted, useExternalListener, useState } from "@odoo/owl";
// import { ErrorBarcodePopup } from "@point_of_sale/app/barcode/error_popup/barcode_error_popup";

// import { Numpad } from "@point_of_sale/app/generic_components/numpad/numpad";
// import { ProductsWidget } from "@point_of_sale/app/screens/product_screen/product_list/product_list";
// import { ActionpadWidget } from "@point_of_sale/app/screens/product_screen/action_pad/action_pad";
// import { Orderline } from "@point_of_sale/app/generic_components/orderline/orderline";
// import { OrderWidget } from "@point_of_sale/app/generic_components/order_widget/order_widget";



//     // const PosComponent = require('point_of_sale.PosComponent');
//     // const Registries = require('point_of_sale.Registries');

// export class DeliveryScreenWidget extends PosComponent {
//         constructor() {
//             console.log("DeliveryScreenWidget");
//             super(...arguments);
            
//         }

//         async onClick() {
//             const { confirmed, payload: result } = await this.showTempScreen(
//                 'DeliveryOrdersScreen',
//                 {
//                     move: null,
//                 }
//             );
//             if (confirmed) {
//                 debugger
//             }
//         }

//         // mounted() {
//         //     console.log("DeliveryScreenWidget");
//         //     posbus.on('reload-orders', this, this.render);
//         // }

//         // willUnmount() {
//         //     posbus.off('reload-orders', this, null);
//         // }

//         get isHidden() {
//             if (!this.env || !this.env.pos || !this.env.pos.config || (this.env && this.env.pos && this.env.pos.config && !this.env.pos.config.management_invoice)) {
//                 return true
//             } else {
//                 return false
//             }
//         }

//         get count() {
//             let zmalllive = JSON.parse(window.localStorage.getItem("livedata"))
//             if(zmalllive != undefined){
//                 return zmalllive.length;
//             }
//             else{
//                 return 0;
//             }
//         }
//     }

//     DeliveryScreenWidget.template = 'DeliveryScreenWidget';

//     registry.add(DeliveryScreenWidget);
//     registry.category("pos_screens").add("DeliveryScreenWidget", DeliveryScreenWidget);

// 