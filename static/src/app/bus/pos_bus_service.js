/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { PosBus } from "@point_of_sale/app/bus/pos_bus_service";

patch(PosBus.prototype, {
    setup(env, { pos, orm, bus_service }) {
        super.setup(...arguments);
        this.env = env;
        this.pos = pos;
        this.orm = orm;
        this.bus_service = bus_service;
    },

    dispatch(message) {
        super.setup(...arguments);

        const deliveryOrdersScreen = this.env.pos.get('DeliveryOrdersScreen');
        if (deliveryOrdersScreen) {
            switch (message.type) {
                case 'setloading':
                    deliveryOrdersScreen.setLoading(message.payload);
                    break;
                case 'authzmall':
                    deliveryOrdersScreen.authZmall(message.payload);
                    break;
                case 'filter-selected':
                    deliveryOrdersScreen._onFilterSelected(message.payload);
                    break;
                case 'search':
                    deliveryOrdersScreen._onSearch(message.payload);
                    break;
                case 'event-keyup-search-order':
                    deliveryOrdersScreen._eventKeyupSearchOrder(message.payload);
                    break;
                default:
                    // Handle other message types if needed
                    break;
            }
        }
    },
});











// import { patch } from "@web/core/utils/patch";
// import { PosBus } from "@point_of_sale/app/bus/pos_bus_service";
// import { useListener } from "@web/core/utils/hooks";

// patch(PosBus.prototype, {
//     setup(env, { pos, orm, bus_service }) {
//         super.setup(...arguments);

//         useListener('actionConfirm', () => this.actionConfirm());
//         useListener('actionPreview', () => this.actionPreview());
//         useListener('actionCancelEntry', () => this.actionCancelEntry());
//         useListener('actionResetDraft', () => this.actionResetDraft());
//     },

//     async dispatch(message) {
//         super.dispatch(...arguments);

//         if (message.type === "get_store_info") {
//             let requestData = message.payload;
//             console.log("==================== requestData ====================");
//             console.log(requestData);
//             await this.rpc({
//                 model: 'pos.config',
//                 method: 'get_store_info',
//                 args: [[], requestData],
//                 context: {
//                     pos: true
//                 }
//             }).then(async function (value) {
//                 console.log("==================== requestData ====================");
//                 console.log(value);
//                 this.trigger('setloading', true);
//                 if (value === "reauth") {
//                     //auth
//                     await this.trigger('authzmall');
//                     return await this.getStoreData();
//                 }
//             });
//         }
//     },

//     actionConfirm() {
//         // Implement the actionConfirm method here
//     },

//     actionPreview() {
//         // Implement the actionPreview method here
//     },

//     actionCancelEntry() {
//         // Implement the actionCancelEntry method here
//     },

//     actionResetDraft() {
//         // Implement the actionResetDraft method here
//     },
// });

// import {useService, useAutofocus} from "@web/core/utils/hooks";
// import { patch } from "@web/core/utils/patch";
// import { PosBus } from "@point_of_sale/app/bus/pos_bus_service";

// patch(PosBus.prototype, {
//     setup(env, { pos, orm, bus_service }) {
//         super.setup(...arguments);
//         this.rpc = useService("rpc");
//     },

//     // setup(){
//     //     super.setup();
//     //     this.rpc = rpc;
//     // },


//     dispatch(message) {
//         super.dispatch(...arguments);

//         if (message.type === "get_store_info") {
//             let requestData = message.payload;
//             console.log("==================== requestData ====================");
//             console.log(requestData);
//             this.rpc({
//                 model: 'pos.config',
//                 method: 'get_store_info',
//                 args: [[], requestData],
//                 context: {
//                     pos: true
//                 }
//             }).then(async function (value) {
//                 console.log("==================== requestData ====================");
//                 console.log(value);
//                 this.trigger('setloading', true);
//                 if (value === "reauth") {
//                     //auth
//                     await this.trigger('authzmall');
//                     return await this.getStoreData();
//                 }
//             });
//         }
//     },
// });

// useListener('setloading', this.setLoading);
// useListener('authzmall', this.authZmall);
// useListener('filter-selected', this._onFilterSelected);
// useListener('search', this._onSearch);
// useListener('event-keyup-search-order', this._eventKeyupSearchOrder);

// import { patch } from "@web/core/utils/patch";
// import { PosBus } from "@point_of_sale/app/bus/pos_bus_service";

// patch(PosBus.prototype, {
//     setup(env, { pos, orm, bus_service }) {
//         super.setup(...arguments);
//         this.env = env;
//     },

//     dispatch(message) {
//         super.dispatch(...arguments);

//         switch (message.type) {
//             case 'setloading':
//                 this.setLoading(message.payload);
//                 break;
//             case 'authzmall':
//                 this.authZmall(message.payload);
//                 break;
//             case 'filter-selected':
//                 this._onFilterSelected(message.payload);
//                 break;
//             case 'search':
//                 this._onSearch(message.payload);
//                 break;
//             case 'event-keyup-search-order':
//                 this._eventKeyupSearchOrder(message.payload);
//                 break;
//             default:
//                 // Handle other message types if needed
//                 break;
//         }
//     },

//     // Define the methods that were previously used with useListener
//     setLoading(payload) {
//         // Implement the method
//     },

//     authZmall(payload) {
//         // Implement the method
//     },

//     _onFilterSelected(payload) {
//         // Implement the method
//     },

//     _onSearch(payload) {
//         // Implement the method
//     },

//     _eventKeyupSearchOrder(payload) {
//         // Implement the method
//     },
// });