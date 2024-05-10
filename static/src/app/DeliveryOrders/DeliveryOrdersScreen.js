/** @odoo-module **/

/** @odoo-module */ 
/** @odoo-module **/
/** @odoo-module **/



import { registry } from "@web/core/registry";
import { Component, useState, onMounted, useExternalListener,onWillStart,useListener ,onWillUnmount, useRef} from "@odoo/owl";
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
import { ControlButtonPopup } from "@point_of_sale/app/screens/product_screen/control_buttons/control_buttons_popup";
import { ConnectionLostError } from "@web/core/network/rpc_service";
import { ErrorBarcodePopup } from "@point_of_sale/app/barcode/error_popup/barcode_error_popup";
import { Numpad } from "@point_of_sale/app/generic_components/numpad/numpad";
import { ProductsWidget } from "@point_of_sale/app/screens/product_screen/product_list/product_list";
import { ActionpadWidget } from "@point_of_sale/app/screens/product_screen/action_pad/action_pad";
import { Orderline } from "@point_of_sale/app/generic_components/orderline/orderline";
import { ConfirmPopup } from "@point_of_sale/app/utils/confirm_popup/confirm_popup";
import { OrderWidget } from "@point_of_sale/app/generic_components/order_widget/order_widget";
import { SelectionPopup } from "@point_of_sale/app/utils/input_popups/selection_popup";
import { ErrorPopup } from "@point_of_sale/app/errors/popups/error_popup";
import { MoneyDetailsPopup } from "@point_of_sale/app/utils/money_details_popup/money_details_popup";






import { debounce } from "@web/core/utils/timing";

import { useAsyncLockedMethod } from "@point_of_sale/app/utils/hooks";
import { session } from "@web/session";
import { PartnerDetailsEdit } from "@point_of_sale/app/screens/partner_list/partner_editor/partner_editor";
import { DeliverOrderEdit } from "./DeliveryOrderEditor";

import { PartnerLine } from "@point_of_sale/app/screens/partner_list/partner_line/partner_line";
import { DeliveryOrderLine } from "./DeliveryOrderLine";



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



import { hooks } from '@odoo/owl';

// const { useListener } = hooks;

// import { useService } from "@web/core/utils/hooks";

export class DeliveryOrdersScreen extends Component {
    static template = "pos_etta.DeliveryOrdersScreen";
    static components = { DeliverOrderEdit,PartnerDetailsEdit, DeliveryOrderLine };

    constructor() {
        super(...arguments);
       
        this.clickOrderLineEtta = this.clickOrderLineEtta.bind(this);
      
        
        console.log(this.env.pos);
        console.log(this.env.services.pos.db);
        this.state = {
            zmallorders : {},
            // moves: this.env.pos.db.get_invoices(),
            moves :this.env.services.pos.db,
            queryOrder:null,
            query: null,
            selectedMove: this.props.move,
            detailIsShown: false,
            productSyncPageIsShown: false,
            isEditMode: false,
            // editModeProps: {
            //     move: null
            // },
            loading: false,
        };
        this.updateOrderList = debounce(this.updateOrderList, 70);
        this.env.services.pos_bus.bus_service.addEventListener('myEvent', ({ detail }) => {
            console.log("event listeners are working well");
            
        });

        // this.env.services.pos_bus.bus_service.addEventListener('setloading', ({ detail }) => {
        //     console.log("on setloading")
        //     this.this.setLoading();
        // });
        // this.env.services.pos_bus.bus_service.addEventListener('authzmall', ({ detail }) => {
        //     console.log("on authzmall")
        //     this.authZmall();
        // });
        // this.env.services.pos_bus.bus_service.addEventListener('filter-selected', ({ detail }) => {
        //     console.log("on filter-selected")
        //     this._onFilterSelected();
        // });
        // this.env.services.pos_bus.bus_service.addEventListener('search', ({ detail }) => {
        //     console.log("on search event")
        //     this._onSearch();
            
        // });
        // this.env.services.pos_bus.bus_service.addEventListener('event-keyup-search-order', ({ detail }) => {
        //     console.log("event-keyup-search-order")
        //     this._eventKeyupSearchOrder();
        // });
        // useListener('setloading', this.setLoading);
        // useListener('authzmall', this.authZmall);
        // useListener('filter-selected', this._onFilterSelected);
        // useListener('search', this._onSearch);
        // useListener('event-keyup-search-order', this._eventKeyupSearchOrder);
        this.searchDetails = {};
        this.filter = null;
        // this._initializeSearchFieldConstants();
        this.moves = this.env.services.pos.db;
        // this.moves = this.env.pos.db.get_invoices();

        this.loading = false;
        this.state.zmallorders = {}
        // this.zmallproduct = [];
        //check if zmall product exists
        console.log("before checking check zmall product exists");
        this.checkZmallProductExist();

    }


    setup() {
        // this.authZmall();
        let self = this;
        console.log("hello this is setup");
        super.setup();

        this.ui = useState(useService("ui"));
        this.notification = useService("pos_notification");
        this.searchWordInputRef = useRef("search-word-input-partner");
        this.state.zmallorders = {}


        this.updatePartnerList = debounce(this.updatePartnerList, 70);
        this.saveChanges = useAsyncLockedMethod(this.saveChanges);
        onWillUnmount(this.updatePartnerList.cancel);
        this.partnerEditor = {}; // create an imperative handle for PartnerDetailsEdit
        this.orderEditor = {};
        this.notif = useService('notification');
        this.env.services.notification = useService('notification');
        // this.notification = useService("pos_notification");
        this.popup = useService("popup");
        this.orm = useService("orm");
        this.hardwareProxy = useService("hardware_proxy");
        this.printer = useService("printer");
        this.pos = usePos();

        this.rpc = useService('rpc');
        const posBus = useService('pos_bus');
        console.log(posBus);
        // console.log(this.env.services.pos_bus)

        this.env.services.pos_bus.bus_service.trigger('myEvent', { myData: 'Hello, world!' });
        console.log("mounted from setup");
        this.state = useState({
            query: null,
            selectedPartner: this.props.partner,
            selectedOrder : this.props.order,
            detailIsShown: this.props.editModeProps ? true : false,
            editModeProps: {
                order : this.props.editModeProps ? this.props.order : null,
                partner: this.props.editModeProps ? this.props.partner : null,
                missingFields: this.props.missingFields ? this.props.missingFields : null,
            },
            previousQuery: "",
            currentOffset: 0,
        });

    //     let self = this;
        
   
    self.authZmall();

    console.log("module is mounted successfully from setup");

    if (this.polling) {
        clearInterval(this.polling);
    }
    this.res = {};
    

    this.polling = setInterval(() => {
            this.res = this.pollForOrders();
            this.res.then(function(value) {
                console.log("Resolved value: ", value);
            }).catch(function(error) {
                console.log("Error: ", error);
            });
        }, 5000);
    
    this.polling = null;
};






    
// onWillStart() {
//             let self = this;
//             console.log("on onWillstart := module is mounted successfully");
//             self.polling = setInterval(function () {
//                 console.log('_poll_for_zmall_response');

//                 if (this.was_cancelled) {
//                     console.log('was_cancelled');

//                     resolve(false);
//                     return Promise.resolve();
//                 }

//                 self.getOrdersFromBackEnd().catch(function (data) {
//                     if (self.remaining_polls != 0) {
//                         self.remaining_polls--;
//                     } else {
//                         reject();
//                         // self.poll_error_order = self.pos.get_order();
//                         return self._handle_odoo_connection_failure(data);
//                     }
//                     return Promise.reject(data);
//                 }).then(function (status) {
//                     console.log(status);
//                     console.log("ROSOLVED")

//                     resolve(true);
//                     self.render();
//                 });

//             }, 5000);
//     }
    
    willUnmount() {
        clearInterval(this.polling);
    }


    


    // setup() {
    //     super.setup();
    //     this.env.services.notification = useService('notification');
    //     // this.notification = useService("pos_notification");
    //     this.popup = useService("popup");
    //     this.orm = useService("orm");
    //     this.hardwareProxy = useService("hardware_proxy");
    //     this.printer = useService("printer");
    //     this.pos = usePos();

    //     this.rpc = useService('rpc');
    //     const posBus = useService('pos_bus');
    //     console.log(posBus);
    //     // console.log(this.env.services.pos_bus)

    //     this.env.services.pos_bus.bus_service.trigger('myEvent', { myData: 'Hello, world!' });
    //     console.log("mounted from setup");
    //     let self = this;

    //     var res = new Promise(function (resolve, reject) {
    //         console.log(self.polling);
    //         clearTimeout(self.polling);

    //         self.polling = setInterval(function () {
    //             console.log('_poll_for_zmall_response');

    //             if (this.was_cancelled) {
    //                 console.log('was_cancelled');

    //                 resolve(false);
    //                 return Promise.resolve();
    //             }

    //             self.getOrdersFromBackEnd().catch(function (data) {
    //                 if (self.remaining_polls != 0) {
    //                     self.remaining_polls--;
    //                 } else {
    //                     reject();
    //                     // self.poll_error_order = self.pos.get_order();
    //                     return self._handle_odoo_connection_failure(data);
    //                 }
    //                 return Promise.reject(data);
    //             }).then(function (status) {
    //                 console.log(status);
    //                 console.log("ROSOLVED")

    //                 resolve(true);
    //                 self.render();
    //             });

    //         }, 5000);
    //     // this.env.services.pos_bus.bus_service.send('myEvent', { myData: 'Hello, world!' });
    
    //     // posBus.trigger('get_store_info', {
    //     //     // Add any payload you want to send with the message here
    //     // });
    //     // this.env.services.posBus.dispatch({
    //     //     type: 'authZmall',
    //     //     payload: true,
    //     // });
        
    
    //     // Send the "get_store_info" message
    //     // posBus.dispatch({
    //     //     type: 'authZmall',
    //     //     payload: {},
    //     // });
    // })};

  

    // async willStart() {
    //     super.willStart()
    //     console.log("mounted");
    //     let self = this;

    //     var res = new Promise(function (resolve, reject) {
    //         clearTimeout(self.polling);

    //         self.polling = setInterval(function () {
    //             console.log('_poll_for_zmall_response');

    //             if (this.was_cancelled) {
    //                 console.log('was_cancelled');

    //                 resolve(false);
    //                 return Promise.resolve();
    //             }

    //             self.getOrdersFromBackEnd().catch(function (data) {
    //                 if (self.remaining_polls != 0) {
    //                     self.remaining_polls--;
    //                 } else {
    //                     reject();
    //                     // self.poll_error_order = self.pos.get_order();
    //                     return self._handle_odoo_connection_failure(data);
    //                 }
    //                 return Promise.reject(data);
    //             }).then(function (status) {
    //                 console.log("ROSOLVED")
    //                 resolve(true);
    //                 self.render();
    //             });

    //         }, 5000);
    //     });

    //     // make sure to stop polling when we're done
    //     res.then(function () {
    //         console.log("RES THEN CALLED")
    //         self._reset_state();
    //     });
    //     this.state.loading = true;
    //     try {
    //         // const moves = await this.env.pos.db.get_invoices();
    //         const moves = null;
    //         this.state.moves = moves;
    //     } finally {
    //         this.state.loading = false;
    //     }
    // }

    // onMounted() {
    //     super.onMounted()
    //     console.log("mounted");
    //     let self = this;

    //     var res = new Promise(function (resolve, reject) {
    //         clearTimeout(self.polling);

    //         self.polling = setInterval(function () {
    //             console.log('_poll_for_zmall_response');

    //             if (this.was_cancelled) {
    //                 console.log('was_cancelled');

    //                 resolve(false);
    //                 return Promise.resolve();
    //             }

    //             self.getOrdersFromBackEnd().catch(function (data) {
    //                 if (self.remaining_polls != 0) {
    //                     self.remaining_polls--;
    //                 } else {
    //                     reject();
    //                     // self.poll_error_order = self.pos.get_order();
    //                     return self._handle_odoo_connection_failure(data);
    //                 }
    //                 return Promise.reject(data);
    //             }).then(function (status) {
    //                 console.log("ROSOLVED")
    //                 resolve(true);
    //                 self.render();
    //             });

    //         }, 5000);
    //     });

    //     // make sure to stop polling when we're done
    //     res.then(function () {
    //         console.log("RES THEN CALLED")
    //         self._reset_state();
    //     });
    // }

    setLoading(loading) {
        this.state.loading = loading;
    }
    setZmallOrders(values){
        console.log("in setzmallorders");
        this.state.zmallorders = values;
        console.log("+++====>>>>  this.state.zmallorders = ", JSON.stringify(this.state.zmallorders, null, 2));
        
    }
    getZmallorders(){
        console.log("get zmall orders ths.state.zmallorders = "+this.state.zmallorders);
        return this.state.zmallorders;
        

    }
    // ----------------------------------------------------------------------------------------------------------------

    openCompanyProfile() {
        if (this.state.productSyncPageIsShown) {
            this.state.productSyncPageIsShown = false;
        }
        this.state.detailIsShown = true;
        this.render();
    }

    openProductsPage() {
        console.log("================= openProductsPage")
        if (this.state.detailIsShown) {
            this.state.detailIsShown = false;
        }
        this.state.productSyncPageIsShown = true;

        console.log(this.state.productSyncPageIsShown);
        console.log(this.state.detailIsShown);
        this.render();
    }

    async authZmall() {
        let self = this;
        self.setLoading(true);
        console.log("check properties of authzmall");
        console.log("in authzmall")

        console.log("this.pos"+this.pos)
        console.log("this.pos.config.id"+this.pos.config.id)
        console.log(this.pos.config_id)
        // await this.rpc({
            await jsonrpc('/web/dataset/call_kw/pos.config/auth_zmall/',{
                model: 'pos.config',
                method: 'auth_zmall',
                args: [this.pos.config.id],
                kwargs: {
                    context: {
                        pos: true
                    }
                }
            
        }).then(function (values) {
            console.log("values after the fetch: " + values);
            self.setLoading(false);
            window.localStorage.setItem("server_token", values.server_token);
            window.localStorage.setItem("store_id", values.store_id);
            console.log("ZMALL RESPOSNSE");
            console.log(values);
            return values;
        }, function (err) {
            console.log("Error RESPOSNSE");
            self.setLoading(false);
            return err;
        });
    }

    async  pollForOrders() {
        console.log('_poll_for_zmall_response');
    
        if (this.was_cancelled) {
            console.log('was_cancelled');
            return false;
        }
    
        try {
            let status = await this.getOrdersFromBackEnd();
            console.log("ROSOLVED");
            this.render();
            return true;
        } catch (data) {
            if (this.remaining_polls != 0) {
                this.remaining_polls--;
            } else {
                this._handle_odoo_connection_failure(data);
                throw data;
            }
        }
    }

    async getOrdersData() {
        let self = this;
        // await this.authZmall();
        self.setLoading(true);
        let storeId = window.localStorage.getItem("store_id");
        let serverToken = window.localStorage.getItem("server_token");
        console.log("storeId" + storeId);
        console.log("serverToken" + serverToken);
        let requestData = {
            "config_id": this.pos.config.id,
            "store_id": storeId,
            "server_token": serverToken
        }
        // const config_id = this.pos.config.id;
        // await this.rpc({
        
        await jsonrpc('/web/dataset/call_kw/pos.config/get_zmall_orders/',{
            model: 'pos.config',
            method: 'get_zmall_orders',
            args: [[], requestData],
            kwargs: {
                context: {
                    pos: true
                }
            }

        }).then(function (values) {
            self.setLoading(false);
            console.log("ZMALL ORDERS RESPOSNSE");
            console.log("live data: " + JSON.stringify(values));
            console.log(values);
            window.localStorage.setItem("livedata", JSON.stringify(values));
            // this.state.zmallorders = values;
            self.setZmallOrders(values);
            return values;

        }, function (err) {
            self.setLoading(false);
            console.log("=========err=========");
            console.log(err);
            return err;
        });
    }

    async setOrdersStatus(data) {
        let self = this;
        self.setLoading(true);
        console.log("======================= setOrdersStatus data =======================")
        console.log(data)
        console.log("======================= setOrdersStatus data =======================")
        // await this.rpc({
        await jsonrpc('/web/dataset/call_kw/pos.config/set_zmall_order_status/',{
            model: 'pos.config',
            method: 'set_zmall_order_status',
            args: [[], data],
            context: {
                pos: true
            },
            kwargs: {}
        }).then(async function (value) {
            console.log( " value after inside setOrderStatus"+value)
            self.setLoading(false);
            console.log("======================= setOrdersStatus value =======================")
            console.log(value)
            console.log("======================= setOrdersStatus value =======================")
            if (value === "reauth") {
                //auth
                await self.authZmall();
                let newstoreId = window.localStorage.getItem("store_id");
                let newserverToken = window.localStorage.getItem("server_token");
                let newdata = {
                    "order_id": data["order_id"],
                    "order_status": data["order_status"],
                    "server_token": newserverToken,
                    "store_id": newstoreId
                }
                return await self.setOrdersStatus(newdata);
            }

            if (value === "done") {
                //refrease or show done message
                console.log("value => " + value);
                await self.getOrdersFromBackEnd();
                return true;
            }

            if (value === "error") {
                //unknown error message
                console.log("value => " + value);
                await self.getOrdersFromBackEnd();
                return false;
            }
            return value;
        }, function (err) {
            self.setLoading(false);
            console.log("=========err=========");
            console.log("the error is "+err)
            console.log(err);
            return err;
        });
    }

    _reset_state() {
        console.log(" ============ _reset_state ============ ")
        this.was_cancelled = false;
        this.last_diagnosis_service_id = false;
        this.remaining_polls = 4;
        clearTimeout(this.polling);
    }

    // mounted() {
    //     super.mounted()
    //     console.log("mounted");
    //     let self = this;

    //     var res = new Promise(function (resolve, reject) {
    //         clearTimeout(self.polling);

    //         self.polling = setInterval(function () {
    //             console.log('_poll_for_zmall_response');

    //             if (this.was_cancelled) {
    //                 console.log('was_cancelled');

    //                 resolve(false);
    //                 return Promise.resolve();
    //             }

    //             self.getOrdersFromBackEnd().catch(function (data) {
    //                 if (self.remaining_polls != 0) {
    //                     self.remaining_polls--;
    //                 } else {
    //                     reject();
    //                     // self.poll_error_order = self.pos.get_order();
    //                     return self._handle_odoo_connection_failure(data);
    //                 }
    //                 return Promise.reject(data);
    //             }).then(function (status) {
    //                 console.log("ROSOLVED")
    //                 resolve(true);
    //                 self.render();
    //             });

    //         }, 5000);
    //     });

    //     // make sure to stop polling when we're done
    //     res.then(function () {
    //         console.log("RES THEN CALLED")
    //         self._reset_state();
    //     });
    // }

    willUnmount() {
        super.willUnmount()
    }

    async getOrdersFromBackEnd() {
        await this.getOrdersData()
        this.render()
    }

    // back() {
    //     if (this.state.detailIsShown || this.state.productSyncPageIsShown) {
    //         this.state.detailIsShown = false;
    //         this.state.productSyncPageIsShown = false;
    //         this.render();
    //     } else {
    //         this.props.resolve({ confirmed: false, payload: false });
    //         this.trigger('close-temp-screen');
    //     }
    // }

    // confirm() {
        // this.props.resolve({ confirmed: true, payload: this.state.selectedMove });
    //     this.trigger('');
    // }

    get getMoves() {
        return JSON.parse(window.localStorage.getItem("livedata"));
    }

    get isNextButtonVisible() {
        return this.state.selectedMove ? true : false;
    }

    // Methods

    // We declare this event handler as a debounce function in
    // order to lower its trigger rate.
    updateOrderList(event) {
        this.state.query = event.target.value;
      
    }

    isItemSelected(status_code, order_status_code) {
        if (order_status_code >= status_code) {
            return true;
        }
        else {
            return false;
        }
    }

    clickCartButton(event) {
        // this.trigger('zmallClickProduct', this.zmallproduct);
        console.log("=======>>> clickCartButton");
        console.log(event);
        let list = [];
        

        for (let index = 0; index < event.cart_items.length; index++) {
            let customer_name = event['customer_name']
            const item = event.cart_items[index];
            let category_name = item['category_name'];
            let itemname = item['full_product_name'];
            let unique_id = item['unique_id'];
            let note_for_item = item['note_for_item'];
            let full_product_name = item['full_product_name']
            let total_item_price = item['total_item_price']

            let text = "[" + category_name + "] " + itemname;
            if(note_for_item != ""){
                text = text + " Note => " + note_for_item;
            }
            list.push(
                {
                    'id': unique_id,
                    'name': text,
                    'item': index,
                    'category_name': category_name,
                    'itemname': itemname,
                    'note': note_for_item,
                    'full_product_name': full_product_name,
                    'total_item_price': total_item_price,
                    'customer_name': customer_name,
                    'label':itemname,


                }
            );

            
        }
        let bodyText = '';
        for (let i = 0; i < list.length; i++) {
            if (i>=1){
                bodyText += "&& ";
            }
            // bodyText += `customer:   ${list[i].customer_name}\n`;
            
           
            bodyText += `name: ${list[i].full_product_name}\n`
            bodyText += "\n";
            bodyText += `price : ${list[i].total_item_price}\n`;
            bodyText += `\n`;
            


        }
        console.log(list);

     

        this.popup.add(ConfirmPopup, {
            // confirmText: list[0].name,
            // cancelText: list[0].itemname,
            title: _t(bodyText),
            // items: list,
            // body : _t(bodyText),
            


        });

        // const { confirmed, payload } =  this.popup.add(EditListPopup, {
        //     title: _t("Lot/Serial Number(s) Required"),
        //     name: "detail",
        //     isSingleItem: False,
        //     array: list,
        // });
        // const { confirmed, payload } = this.popup.add(MoneyDetailsPopup, {
        //     moneyDetails: list,
            
        // });
        // const { confirmed } =  this.popup.add(ConfirmPopup, {
        //     title: _t("Change Status"),
        //     body: _t("Do you want to Change Status?"),
        // });

    }

    // async clickOrderLine(event) {
    //     let self = this;
    //     console.log("============ORDER_CLICK============");
    //     console.log(event);
    //     let order_status_code = event.order_status;

    //     await this.popup.add('SelectionPopup', {
    //         title: _t('Change Order Status'),
    //         list: [
    //             {
    //                 id: 1,
    //                 item: 1,
    //                 label: "New",
    //                 imageUrl: "/pos_zmall/static/description/created.png",
    //                 isSelected: this.isItemSelected(1, event.order_status)
    //             },
    //             {
    //                 id: 3,
    //                 item: 3,
    //                 label: "Accepted",
    //                 imageUrl: "/pos_zmall/static/description/accepted.png",
    //                 isSelected: this.isItemSelected(3, event.order_status)
    //             },
    //             {
    //                 id: 5,
    //                 item: 5,
    //                 label: "Prepared",
    //                 imageUrl: "/pos_zmall/static/description/prepared.png",
    //                 isSelected: this.isItemSelected(5, event.order_status)
    //             },
    //             {
    //                 id: 7,
    //                 item: 7,
    //                 label: "Ready",
    //                 imageUrl: "/pos_zmall/static/description/ready.png",
    //                 isSelected: this.isItemSelected(7, event.order_status)
    //             }
    //         ]
    //     }).then(async (selectedstatus) => {
    //         if (selectedstatus) {
    //             if (selectedstatus.payload <= order_status_code) {
    //                 await this.popup.add('ErrorPopup', {
    //                     title: _t('Invalid Action'),
    //                     body: _t('Can not revert back to status that has been passed')
    //                 })
    //             }
    //             else {
    //                 let { confirmed, payload: result } = await this.popup.add('ConfirmPopup', {
    //                     title: _t('Confirmation'),
    //                     body: _t('Please double check because this step can not be reversed?')
    //                 })
    //                 if (confirmed) {
    //                     let storeId = window.localStorage.getItem("store_id");
    //                     let serverToken = window.localStorage.getItem("server_token");
    //                     console.log("CHANGE ORDER STATUS");
    //                     console.log("Order ID => " + event.zmall_order_id + " TO Status => " + selectedstatus.payload);
    //                     console.log({
    //                         "order_id": event.zmall_order_id,
    //                         "order_status": selectedstatus.payload,
    //                         "server_token": serverToken,
    //                         "store_id": storeId
    //                     });
    //                     let data = {
    //                         "config_id": this.env.pos.config_id,
    //                         "order_id": event.zmall_order_id,
    //                         "order_status": selectedstatus.payload,
    //                         "server_token": serverToken,
    //                         "store_id": storeId
    //                     };

    //                     let changestatresult = await self.setOrdersStatus(data);
    //                     // await self.setOrdersStatus(data).then(async (selectedstatus) => {

    //                     // });

    //                     console.log("===================== setOrdersStatus result =====================");
    //                     console.log(changestatresult);
    //                     console.log("===================== setOrdersStatus result =====================");

    //                     if (changestatresult) {
    //                         self.env.pos.alert_message({
    //                             title: _t('Info'),
    //                             body: _t('Status Changed Successfully'),
    //                         });
    //                     }
    //                     else {
    //                         self.env.pos.alert_message({
    //                             title: _t('Warning'),
    //                             body: _t('Error Occured Stauts Not Changed'),
    //                         });
    //                     }
    //                 }
    //             }
    //         }

    //     });
    // }


    //  clickOrderLine(event) {
    //     let self = this;
    //     console.log("============ORDER_CLICK============");
    //     console.log(event);
    //     let order_status_code = event.order_status;
    
    //     let selectedstatus =  this.popup.add('SelectionPopup', {
    //         title: _t('Change Order Status'),
    //         list: [
    //             {
    //                 id: 1,
    //                 item: 1,
    //                 label: "New",
    //                 imageUrl: "/pos_zmall/static/description/created.png",
    //                 isSelected: this.isItemSelected(1, event.order_status)
    //             },
    //             {
    //                 id: 3,
    //                 item: 3,
    //                 label: "Accepted",
    //                 imageUrl: "/pos_zmall/static/description/accepted.png",
    //                 isSelected: this.isItemSelected(3, event.order_status)
    //             },
    //             {
    //                 id: 5,
    //                 item: 5,
    //                 label: "Prepared",
    //                 imageUrl: "/pos_zmall/static/description/prepared.png",
    //                 isSelected: this.isItemSelected(5, event.order_status)
    //             },
    //             {
    //                 id: 7,
    //                 item: 7,
    //                 label: "Ready",
    //                 imageUrl: "/pos_zmall/static/description/ready.png",
    //                 isSelected: this.isItemSelected(7, event.order_status)
    //             }
    //         ]
    //     });
    
    //     if (selectedstatus) {
    //         if (selectedstatus.payload <= order_status_code) {
    //              this.popup.add('ErrorPopup', {
    //                 title: _t('Invalid Action'),
    //                 body: _t('Can not revert back to status that has been passed')
    //             });
    //         } else {
    //             let { confirmed, payload: result } =  this.popup.add('ConfirmPopup', {
    //                 title: _t('Confirmation'),
    //                 body: _t('Please double check because this step can not be reversed?')
    //             });
    
    //             if (confirmed) {
    //                 let storeId = window.localStorage.getItem("store_id");
    //                 let serverToken = window.localStorage.getItem("server_token");
    //                 console.log("CHANGE ORDER STATUS");
    //                 console.log("Order ID => " + event.zmall_order_id + " TO Status => " + selectedstatus.payload);
    //                 console.log({
    //                     "order_id": event.zmall_order_id,
    //                     "order_status": selectedstatus.payload,
    //                     "server_token": serverToken,
    //                     "store_id": storeId
    //                 });
    //                 let data = {
    //                     "config_id": this.env.pos.config_id,
    //                     "order_id": event.zmall_order_id,
    //                     "order_status": selectedstatus.payload,
    //                     "server_token": serverToken,
    //                     "store_id": storeId
    //                 };
    
    //                 let changestatresult =  self.setOrdersStatus(data);
    
    //                 console.log("===================== setOrdersStatus result =====================");
    //                 console.log(changestatresult);
    //                 console.log("===================== setOrdersStatus result =====================");
    
    //                 if (changestatresult) {
    //                     self.env.pos.alert_message({
    //                         title: _t('Info'),
    //                         body: _t('Status Changed Successfully'),
    //                     });
    //                 } else {
    //                     self.env.pos.alert_message({
    //                         title: _t('Warning'),
    //                         body: _t('Error Occured Stauts Not Changed'),
    //                     });
    //                 }
    //             }
    //         }
    //     }
    // }

   async clickOrderLineEtta(event) {
        let self = this;
        console.log("============ORDER_CLICK============");
        console.log(event);
        let order_status_code = event.order_status;
        console.log(order_status_code);

        // const { confirmed } =  this.popup.add(ConfirmPopup, {
        //     title: _t(" click orderline "),
        //     body: _t("click orderline?"),
        // });
        // console.log("the result is" + confirmed);
        // if (confirmed){
        //     return "test1";
        // }

    
        console.log("show popup");

        // const { confirmed, payload: selectedOption } = await this.popup.add(SelectionPopup, {
        //     title: _t("What do you want to do?"),
        //     list: [
        //         { id: "0", label: _t("Settle the order"), item: "settle" },
        //         {
        //             id: "1",
        //             label: _t("Apply a down payment (percentage)"),
        //             item: "dpPercentage",
        //         },
        //         {
        //             id: "2",
        //             label: _t("Apply a down payment (fixed amount)"),
        //             item: "dpAmount",
        //         },
        //     ],
        // });
        // const { confirmed, payload: selectedOption } = , also removed this because it is creating destructure problem
        await this.popup.add(SelectionPopup, {
            title: _t('Change Order Status'),
            list: [
                {
                    id: 1,
                    item: 1,
                    label: _t("New"),
                    imageUrl: "/pos_etta/static/description/created.png",
                    isSelected: this.isItemSelected(1, event.order_status)
                    
                },
                {
                    id: 3,
                    item: 3,
                    label: "Accepted",
                    imageUrl: "/pos_etta/static/description/accepted.png",
                    isSelected: this.isItemSelected(3, event.order_status)
                },
                {
                    id: 5,
                    item: 5,
                    label: "Prepared",
                    imageUrl: "/pos_etta/static/description/prepared.png",
                    isSelected: this.isItemSelected(5, event.order_status)
                },
                {
                    id: 7,
                    item: 7,
                    label: "Ready",
                    imageUrl: "/pos_etta/static/description/ready.png",
                    isSelected: this.isItemSelected(7, event.order_status)
                }
            ]
        }).then( async (selectedstatus) => {
            
            console.log("after the popup is selected")
            console.log(selectedstatus)
            console.log("order status code:"+ order_status_code)
            if (selectedstatus) {
                if (selectedstatus.payload <= order_status_code) {
                     this.popup.add(ErrorPopup, {
                        title: _t('Invalid Action'),
                        body: _t('Can not revert back to status that has been passed')
                    });
                } else {
                    // let { confirmed} , it was like this but this thing creates a distructuring issue.
                   let {confirmed} =  await this.popup.add(ConfirmPopup, {
                        title: _t('Confirmation'),
                        body: _t('Please double check because this step can not be reversed?')
                    });
                    console.log("after confirmation:" + confirmed);
                    
    
                    // if (confirmed) {
                    if (confirmed){
                        let storeId = window.localStorage.getItem("store_id");
                        let serverToken = window.localStorage.getItem("server_token");
                        console.log("inside true");
                        console.log("CHANGE ORDER STATUS");
                        console.log("Order ID => " + event.zmall_order_id + " TO Status => " + selectedstatus.payload);
                        console.log({
                            "order_id": event.zmall_order_id,
                            "order_status": selectedstatus.payload,
                            "server_token": serverToken,
                            "store_id": storeId
                        });
                        let data = {
                            "config_id": this.pos.config.id,
                            "order_id": event.zmall_order_id,
                            "order_status": selectedstatus.payload,
                            "server_token": serverToken,
                            "store_id": storeId
                        };
                        console.log("data"+data);
    
                        let changestatresult = self.setOrdersStatus(data);
    
                        console.log("===================== setOrdersStatus result =====================");
                        console.log(changestatresult);
                        console.log("===================== setOrdersStatus result =====================");
    
                        if (changestatresult) {
                            console.log("status changed successfully");
                            this.env.services.notification.add("Status Changed Successfully", {
                                type: 'info',
                                sticky: false,
                                timeout: 10000,
                            });
                            // self.popup.add(notification,{
                            //     title: _t('Info'),
                            //     body: _t('Status Changed Successfully'),
                            // });
                        } else {
                            console.log("error occured stauts not changed");
                            this.env.services.notification.add("Error Occured Stauts Not Changed", {
                                type: 'danger',
                                sticky: false,
                                timeout: 10000,
                            });
                            // self.popup.add(notification,{
                            //     title: _t('Warning'),
                            //     body: _t('Error Occured Stauts Not Changed'),
                            // });
                        }
                    }
                }
            }
        });
    }

    clickNext() {
        this.state.selectedMove = this.nextButton.command === 'set' ? this.state.selectedMove : null;
        this.confirm();
    }

    clearSearch() {
        this._initializeSearchFieldConstants()

        this.filter = this.filterOptions[0];
        this.searchDetails = {};
        this.moves = this.env.pos.db.get_invoices()
        this.getOrdersFromBackEnd()
    }


    // TODO: ==================== Seach bar example ====================

    get searchBarConfig() {
        return {
            searchFields: this.constants.searchFieldNames,
            filter: { show: true, options: this.filterOptions },
        };
    }

    // TODO: define search fields
    get _searchFields() {
        return {} // TODO: 15.07.2021 turnoff it, automatic search when cashier typing searchbox
     
    }

    // TODO: define group filters
    get filterOptions() { // list state for filter
        return [
            'All Items',
            'New',
            'Accepted',
            'Prepared',
            'Ready',
        ];
    }

    get _stateSelectionFilter() {
        return {
            draft: 'New',
            accepted: 'Accepted',
            prepared: 'Prepared',
            ready: 'Ready',
        };
    }

    // TODO: register search bar
    _initializeSearchFieldConstants() {
        console.log("Initializing");
        this.constants = {};
        Object.assign(this.constants, {
            searchFieldNames: Object.keys(this._searchFields),
            stateSelectionFilter: this._stateSelectionFilter,
        });
    }

    // TODO: save filter selected on searchbox of user for getOrders()
    _onFilterSelected(event) {
        this.filter = event.detail.filter;
        this.render();
    }

    // TODO: save search detail selected on searchbox of user for getOrders()
    _onSearch(event) {
        const searchDetails = event.detail;
        Object.assign(this.searchDetails, searchDetails);
        this.render();
    }
    
    _eventKeyupSearchOrder(event) {
        const searchInput = event.detail
        if (searchInput != "") {
            this.moves = this.env.pos.db.search_invoice(searchInput)
        } else {
            this.moves = this.env.pos.db.get_invoices()
        }
        this.render()
    }

    // TODO: return orders of system
    get moveList() {
        return this.moves
    }
    getElapsedTime(created_at) {
            var dateString = created_at;
            var currentDate = new Date();
            var elapsedTime = currentDate - new Date(dateString);
            // Convert to seconds
            var seconds = elapsedTime / 1000;

            // Convert to minutes
            var minutes = seconds / 60;

            // Convert to hours
            var hours = minutes / 60;

            // Convert to days
            var days = hours / 24;

            if (seconds < 60) {
                return seconds > 1 ? Number(seconds).toFixed() + " secs ago" : Number(seconds).toFixed() + " sec ago"
            }
            else if (seconds > 60 && seconds < 3600) {
                return minutes > 1 ? Number(minutes).toFixed() + " mins ago" : Number(minutes).toFixed() + " min ago"
            }
            else if (seconds > 3600 && seconds < 86400) {
                return hours > 1 ? Number(hours).toFixed() + " hours ago" : Number(hours).toFixed() + " hour ago"
            }
            else if (seconds > 86400) {
                return days > 1 ? Number(days).toFixed() + " days ago" : Number(days).toFixed() + " day ago"
            }
        }

    async checkZmallProductExist() {
        let self = this;
        console.log("in check zmall product exist");
        await jsonrpc('/web/dataset/call_kw/product.product/search_read', {
            model: 'product.product',
            method: 'search_read',
            args: [[['default_code', '=', 'ZMALL_001']]],
            kwargs: {}
        }).then(async function (zmall_product_value) {
                console.log("======== >>>>>>>>>> checkZmallProductExist");
                console.log(zmall_product_value);
                console.log("================================ go to theloadzmallproduct")
                if (zmall_product_value.length == 0) {
                    await self.loadZmallProduct()
                }
                else {
                    // this.zmallproduct = zmall_product_value[0];
                }
                // return values;
            }).catch(function (error) {
                console.log("Error: " + error);
                console.error("An error occurred:", error);
            });
    


       



    }

    async loadZmallProduct() {
        await jsonrpc('/pos_zmall/load_zmall_data');
        // // await this.rpc({
        // await jsonrpc({
        //     'route': '/pos_zmall/load_zmall_data',
        // });
    }



    // ------------------------------------------------------------------------------------------------------



    // additionals
        // Lifecycle hooks
    back(force = false) {
        console.log("back ===========================+++++>>>>>>>>>  back is clicked");
        
        this.pos.closeTempScreen();
            if (this.state.detailIsShown && !force) {
                this.state.detailIsShown = false;
            } else {
                // this.props.resolve({ confirmed: false, payload: false });
                this.pos.closeTempScreen();
            }
        }
    
        goToOrders() {
            this.back(true);
            const order = this.state.editModeProps.order;
            const partner = this.state.editModeProps.partner;
            // const partnerHasActiveOrders = this.pos
            //     .get_order_list()
            //     .some((order) => order.partner?.id === partner.id);
            const ui = {
                searchDetails: {
                    fieldName: "ORDER",
                    searchTerm: order.unique_id,
                },
                filter: partnerHasActiveOrders ? "" : "SYNCED",
            };
            this.pos.showScreen("TicketScreen", { ui });
        }
    
        confirm() {
            // this.resolve({ confirmed: true, payload: this.state.selectedPartner });
            this.pos.closeTempScreen();
        }
        activateEditMode() {
            this.state.detailIsShown = true;
        }
        // Getters
    
        get currentOrder() {
            return this.pos.get_order();
        }
    
        get partners() {
            // let order =   this.getOrdersFromBackEnd();
            // console.log("orders"+order)
            let res;
            if (this.state.query && this.state.query.trim() !== "") {
                res = this.pos.db.search_partner(this.state.query.trim());
            } else {
                res = this.pos.db.get_partners_sorted(1000);
            }
            res.sort(function (a, b) {
                return (a.name || "").localeCompare(b.name || "");
            });
            // the selected partner (if any) is displayed at the top of the list
            if (this.state.selectedPartner) {
                const indexOfSelectedPartner = res.findIndex(
                    (partner) => partner.id === this.state.selectedPartner.id
                );
                if (indexOfSelectedPartner !== -1) {
                    res.splice(indexOfSelectedPartner, 1);
                }
                res.unshift(this.state.selectedPartner);
            }
            console.log("delevery order Screen js partners res"+ res);
            // for(let item of res){
            //     for(let [key, value] of Object.entries(item)){
            //         console.log(`Key: ${key}, Value: ${value}`);
            //     }
            // }
            return res;
        }
        get orders() {
            let res;
            // let order =  this.getOrdersFromBackEnd();
            // console.log("orders"+order)
            if (this.state.query && this.state.query.trim() !== "") {
                res = this.pos.db.search_partner(this.state.query.trim());
            } else {
                res = this.pos.db.get_partners_sorted(1000);
            }
            res.sort(function (a, b) {
                return (a.name || "").localeCompare(b.name || "");
            });
            // the selected partner (if any) is displayed at the top of the list
            if (this.state.selectedOrder) {
                const indexOfSelectedPartner = res.findIndex(
                    (order) => order.unique_id === this.state.selectedPartner.unique_id
                );
                if (indexOfSelectedPartner !== -1) {
                    res.splice(indexOfSelectedPartner, 1);
                }
                res.unshift(this.state.selectedPartner);
            }
            console.log("delevery order Screen js orders res"+ res);
            return res;
        }
        get isBalanceDisplayed() {
            return false;
        }
        get partnerLink() {
            return `/web#model=res.partner&id=${this.state.editModeProps.order.unique_id}`;
        }
    
        // Methods
        _onPressEnterKeyOrder() {
            console.log("@@@@@@@@@@@@@@@@@@@@@@@@_onPressEnterKeyOrder")
            if (!this.state.queryOrder) {
                console.log("================================not this.state.queryOrder")
                return;
            }
            const result = this.searchOrder();
            if (result.length > 0) {
                this.notification.add(
                    _t('%s order(s) found for "%s".', result.length, this.state.queryOrder),
                    3000
                );
            } else {
                this.notification.add(_t('No more order found for "%s".', this.state.queryOrder), 3000);
            }
        }
        
        updateOrderList(event) {
            this.state.queryOrder = event.target.value;
        }
        
        // searchOrder() {
        //     let self = this;
        //     if (!this.state.queryOrder) {
                
        //         return self.state.zmallorders;
        //     }
        //     console.log("inside search order")
        //     console.log("self.state.zmallorder"+self.state.zmallorders);
        //     const result = self.state.zmallorders.filter(order => 
        //         order.zmall_order_id.includes(this.state.queryOrder) || 
        //         order.customer_name.includes(this.state.queryOrder) 
        //     );
        //     return result;
        // }

        searchOrder() {
            if (!this.state.queryOrder) {
                return this.state.zmallorders;
            }
            console.log("inside search order");
            console.log("this.state.queryorder"+this.state.queryOrder)
        
            const lowerCaseQuery = this.state.queryOrder.toLowerCase();
        
            const result = this.state.zmallorders.filter(order => 
                order.zmall_order_id.toLowerCase().includes(lowerCaseQuery) || 
                order.customer_name.toLowerCase().includes(lowerCaseQuery)
            );
            console.log("results of order search: " + result);
        
            return result;
        }
    
        async _onPressEnterKey() {
            if (!this.state.query) {
                return;
            }
            const result = await this.searchPartner();
            if (result.length > 0) {
                this.notification.add(
                    _t('%s customer(s) found for "%s".', result.length, this.state.query),
                    3000
                );
            } else {
                this.notification.add(_t('No more customer found for "%s".', this.state.query), 3000);
            }
        }
        _clearSearch() {
            this.searchWordInputRef.el.value = "";
            this.state.query = "";
        }
        // We declare this event handler as a debounce function in
        // order to lower its trigger rate.
        async updatePartnerList(event) {
            this.state.query = event.target.value;
            clearInterval(this.polling);
            
        }
        clickPartner(order) {
            if (this.state.selectedOrder && this.state.selectedOrder.unique_id === order.unique_id) {
                this.state.selectedOrder = null;
            } else {
                this.state.selectedOrder = order;
            }
            this.confirm();
        }
        editPartner(order) {
            this.state.editModeProps.order = order;
            this.activateEditMode();
        }
        createPartner() {
            // initialize the edit screen with default details about country, state, and lang
            const { country_id, state_id } = this.pos.company;
            this.state.editModeProps.partner = { country_id, state_id, lang: session.user_context.lang };
            this.activateEditMode();
        }
        async saveChanges(processedChanges) {
            const partnerId = await this.orm.call("res.partner", "create_from_ui", [processedChanges]);
            await this.pos.load_new_partners();
            this.state.selectedPartner = this.pos.db.get_partner_by_id(partnerId);
            this.confirm();
        }
        async searchPartner() {
            if (this.state.previousQuery != this.state.query) {
                this.state.currentOffset = 0;
            }
            const result = await this.getNewPartners();
            this.pos.addPartners(result);
            if (this.state.previousQuery == this.state.query) {
                this.state.currentOffset += result.length;
            } else {
                this.state.previousQuery = this.state.query;
                this.state.currentOffset = result.length;
            }
            return result;
        }
        async getNewPartners() {
            let domain = [];
            const limit = 30;
            if (this.state.query) {
                const search_fields = ["name", "parent_name", "phone_mobile_search", "email"];
                domain = [
                    ...Array(search_fields.length - 1).fill('|'),
                    ...search_fields.map(field => [field, "ilike", this.state.query + "%"])
                ];
            }
            // FIXME POSREF timeout
            const result = await this.orm.silent.call(
                "pos.session",
                "get_pos_ui_res_partner_by_params",
                [[odoo.pos_session_id], { domain, limit: limit, offset: this.state.currentOffset }]
            );
            return result;
        }


        // search feature
        async _onPressEnterKeyOrder() {
            if (!this.state.queryOrder) {
                return;
            }
            const result = await this.searchOrder();
            if (result.length > 0) {
                this.notification.add(
                    _t('%s order(s) found for "%s".', result.length, this.state.queryOrder),
                    3000
                );
            } else {
                this.notification.add(_t('No more order found for "%s".', this.state.queryOrder), 3000);
            }
        }
        
        async updateOrderList(event) {
            this.state.queryOrder = event.target.value;
            clearInterval(this.pollingOrder);
        }
        
        async searchOrder() {
            if (this.state.previousQueryOrder != this.state.queryOrder) {
                this.state.currentOffsetOrder = 0;
            }
            const result = await this.getNewOrders();
            this.pos.addOrders(result);
            if (this.state.previousQueryOrder == this.state.queryOrder) {
                this.state.currentOffsetOrder += result.length;
            } else {
                this.state.previousQueryOrder = this.state.queryOrder;
                this.state.currentOffsetOrder = result.length;
            }
            return result;
        }
        
        async getNewOrders() {
            let domain = [];
            const limit = 30;
            if (this.state.queryOrder) {
                domain = [
                    '|',
                    ['zmall_order_id', 'ilike', this.state.queryOrder + "%"],
                    ['customer_name', 'ilike', this.state.queryOrder + "%"]
                ];
            }
            const result = await this.orm.silent.call(
                "pos.session",
                "get_pos_ui_res_order_by_params",
                [[odoo.pos_session_id], { domain, limit: limit, offset: this.state.currentOffsetOrder }]
            );
            return result;
        }











}

DeliveryOrdersScreen.template = "pos_etta.DeliveryOrdersScreen";
registry.category('pos_screens').add('DeliveryOrdersScreen', DeliveryOrdersScreen);





















// /** @odoo-module */ 
// /** @odoo-module **/
// /** @odoo-module **/



// import { registry } from "@web/core/registry";
// import { Component, useState, onMounted, useExternalListener } from "@odoo/owl";
// import { usePos } from "@point_of_sale/app/store/pos_hook";
// import { useService } from "@web/core/utils/hooks";
// import { _t } from "@web/core/l10n/translation";
// import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";
// import { TextAreaPopup } from "@point_of_sale/app/utils/input_popups/textarea_popup";
// import { Navbar } from "@point_of_sale/app/navbar/navbar";
// import { patch } from "@web/core/utils/patch";
// // import { FiscalReadingPopup } from "./FiscalReadingPopup/FiscalReadingPopup";
// import { jsonrpc } from "@web/core/network/rpc_service";
// import { AbstractAwaitablePopup } from "@point_of_sale/app/popup/abstract_awaitable_popup";
// import { ControlButtonsMixin } from "@point_of_sale/app/utils/control_buttons_mixin";
// import { useBarcodeReader } from "@point_of_sale/app/barcode/barcode_reader_hook";
// import { parseFloat } from "@web/views/fields/parsers";
// import { NumberPopup } from "@point_of_sale/app/utils/input_popups/number_popup";
// import { ErrorPopup } from "@point_of_sale/app/errors/popups/error_popup";
// import { ControlButtonPopup } from "@point_of_sale/app/screens/product_screen/control_buttons/control_buttons_popup";
// import { ConnectionLostError } from "@web/core/network/rpc_service";
// import { ErrorBarcodePopup } from "@point_of_sale/app/barcode/error_popup/barcode_error_popup";
// import { Numpad } from "@point_of_sale/app/generic_components/numpad/numpad";
// import { ProductsWidget } from "@point_of_sale/app/screens/product_screen/product_list/product_list";
// import { ActionpadWidget } from "@point_of_sale/app/screens/product_screen/action_pad/action_pad";
// import { Orderline } from "@point_of_sale/app/generic_components/orderline/orderline";
// import { OrderWidget } from "@point_of_sale/app/generic_components/order_widget/order_widget";

// // Your class or functional component implementation
// // export class DeliveryOrdersScreen extends Component {
// //     // Implementation details...
// // }


// export  class DeliveryOrdersScreen extends Component {
//     static template = "pos_etta.DeliveryOrdersScreen";
//     constructor() {
//         super(...arguments);
//         this.state = {
//             moves: this.env.pos.db.get_invoices(),
//             query: null,
//             selectedMove: this.props.move,
//             detailIsShown: false,
//             productSyncPageIsShown: false,
//             isEditMode: false,
//             editModeProps: {
//                 move: null
//             },
//             loading: false,
//         };
//         this.updateOrderList = debounce(this.updateOrderList, 70);
//         useListener('setloading', this.setLoading);
//         useListener('authzmall', this.authZmall);
//         useListener('filter-selected', this._onFilterSelected);
//         useListener('search', this._onSearch);
//         useListener('event-keyup-search-order', this._eventKeyupSearchOrder);
//         this.searchDetails = {};
//         this.filter = null;
//         this._initializeSearchFieldConstants();
//         this.moves = this.env.pos.db.get_invoices();

//         this.loading = false;
//         // this.zmallproduct = [];
//         //check if zmall product exists
//         this.checkZmallProductExist();

//     }

    // async checkZmallProductExist() {
    //     let self = this;
    //     return await this.rpc({
    //         model: 'product.product',
    //         method: 'search_read',
    //         args: [[['default_code', '=', 'ZMALL_001']]]
    //     }).then(async function (zmall_product_value) {
    //         console.log("======== >>>>>>>>>> checkZmallProductExist");
    //         console.log(zmall_product_value);
    //         if (zmall_product_value.length == 0) {
    //             await self.loadZmallProduct()
    //         }
    //         else {
    //             // this.zmallproduct = zmall_product_value[0];
    //         }
    //         // return values;
    //     }, function (err) {
    //         return err;
    //     });
    // }

    // async loadZmallProduct() {
    //     await this.rpc({
    //         'route': '/pos_zmall/load_zmall_data',
    //     });
    // }

//     get isloading() {
//         return this.state.loading;
//     }

//     getElapsedTime(created_at) {
//         var dateString = created_at;
//         var currentDate = new Date();
//         var elapsedTime = currentDate - new Date(dateString);
//         // Convert to seconds
//         var seconds = elapsedTime / 1000;

//         // Convert to minutes
//         var minutes = seconds / 60;

//         // Convert to hours
//         var hours = minutes / 60;

//         // Convert to days
//         var days = hours / 24;

//         if (seconds < 60) {
//             return seconds > 1 ? Number(seconds).toFixed() + " secs ago" : Number(seconds).toFixed() + " sec ago"
//         }
//         else if (seconds > 60 && seconds < 3600) {
//             return minutes > 1 ? Number(minutes).toFixed() + " mins ago" : Number(minutes).toFixed() + " min ago"
//         }
//         else if (seconds > 3600 && seconds < 86400) {
//             return hours > 1 ? Number(hours).toFixed() + " hours ago" : Number(hours).toFixed() + " hour ago"
//         }
//         else if (seconds > 86400) {
//             return days > 1 ? Number(days).toFixed() + " days ago" : Number(days).toFixed() + " day ago"
//         }
//     }

//     setLoading(loading) {
//         // const overlay = document.getElementById('loading-overlay');
//         this.state.loading = loading;
//         if (loading) {
//             // document.getElementById('loading-overlay').style.display = 'flex';
//         } else {
//             // document.getElementById('loading-overlay').style.display = 'none';
//         }
//     }

//     openCompanyProfile() {
//         if (this.state.productSyncPageIsShown) {
//             this.state.productSyncPageIsShown = false;
//         }
//         this.state.detailIsShown = true;
//         this.render();
//     }

//     openProductsPage() {
//         console.log("================= openProductsPage")
//         if (this.state.detailIsShown) {
//             this.state.detailIsShown = false;
//         }
//         this.state.productSyncPageIsShown = true;

//         console.log(this.state.productSyncPageIsShown);
//         console.log(this.state.detailIsShown);
//         this.render();
//     }

//     async authZmall() {
//         let self = this;
//         self.setLoading(true);
//         await this.rpc({
//             model: 'pos.config',
//             method: 'auth_zmall',
//             args:
//                 [this.env.pos.config_id],
//             context: {
//                 pos: true
//             }
//         }).then(function (values) {
//             self.setLoading(false);
//             window.localStorage.setItem("server_token", values.server_token);
//             window.localStorage.setItem("store_id", values.store_id);
//             console.log("ZMALL RESPOSNSE");
//             console.log(values);
//             return values;
//         }, function (err) {
//             self.setLoading(false);
//             return err;
//         });
//     }

//     async getOrdersData() {
//         let self = this;
//         await this.authZmall();
//         self.setLoading(true);
//         let storeId = window.localStorage.getItem("store_id");
//         let serverToken = window.localStorage.getItem("server_token");
//         console.log("storeId" + storeId);
//         console.log("serverToken" + serverToken);
//         let requestData = {
//             "config_id": this.env.pos.config_id,
//             "store_id": storeId,
//             "server_token": serverToken
//         }
//         await this.rpc({
//             model: 'pos.config',
//             method: 'get_zmall_orders',
//             args: [[], requestData],
//             context: {
//                 pos: true
//             }
//         }).then(function (values) {
//             self.setLoading(false);
//             console.log("ZMALL ORDERS RESPOSNSE");
//             console.log(values);
//             window.localStorage.setItem("livedata", JSON.stringify(values));
//             // this.state.zmallorders = values;
//             return values;
//         }, function (err) {
//             self.setLoading(false);
//             console.log("=========err=========");
//             console.log(err);
//             return err;
//         });
//     }

//     async setOrdersStatus(data) {
//         let self = this;
//         self.setLoading(true);
//         console.log("======================= setOrdersStatus data =======================")
//         console.log(data)
//         console.log("======================= setOrdersStatus data =======================")
//         await this.rpc({
//             model: 'pos.config',
//             method: 'set_zmall_order_status',
//             args: [[], data],
//             context: {
//                 pos: true
//             }
//         }).then(async function (value) {
//             self.setLoading(false);
//             console.log("======================= setOrdersStatus value =======================")
//             console.log(value)
//             console.log("======================= setOrdersStatus value =======================")
//             if (value === "reauth") {
//                 //auth
//                 await self.authZmall();
//                 let newstoreId = window.localStorage.getItem("store_id");
//                 let newserverToken = window.localStorage.getItem("server_token");
//                 let newdata = {
//                     "order_id": data["order_id"],
//                     "order_status": data["order_status"],
//                     "server_token": newserverToken,
//                     "store_id": newstoreId
//                 }
//                 return await self.setOrdersStatus(newdata);
//             }

//             if (value === "done") {
//                 //refrease or show done message
//                 console.log("value => " + value);
//                 self.getOrdersFromBackEnd();
//                 return true;
//             }

//             if (value === "error") {
//                 //unknown error message
//                 console.log("value => " + value);
//                 self.getOrdersFromBackEnd();
//                 return false;
//             }
//             return value;
//         }, function (err) {
//             self.setLoading(false);
//             console.log("=========err=========");
//             console.log(err);
//             return err;
//         });
//     }

//     _reset_state() {
//         console.log(" ============ _reset_state ============ ")
//         this.was_cancelled = false;
//         this.last_diagnosis_service_id = false;
//         this.remaining_polls = 4;
//         clearTimeout(this.polling);
//     }

//     mounted() {
//         super.mounted()
//         let self = this;

//         var res = new Promise(function (resolve, reject) {
//             clearTimeout(self.polling);

//             self.polling = setInterval(function () {
//                 console.log('_poll_for_zmall_response');

//                 if (this.was_cancelled) {
//                     console.log('was_cancelled');

//                     resolve(false);
//                     return Promise.resolve();
//                 }

//                 self.getOrdersFromBackEnd().catch(function (data) {
//                     if (self.remaining_polls != 0) {
//                         self.remaining_polls--;
//                     } else {
//                         reject();
//                         // self.poll_error_order = self.pos.get_order();
//                         return self._handle_odoo_connection_failure(data);
//                     }
//                     return Promise.reject(data);
//                 }).then(function (status) {
//                     console.log("ROSOLVED")
//                     resolve(true);
//                     self.render();
//                 });

//             }, 5000);
//         });

//         // make sure to stop polling when we're done
//         res.then(function () {
//             console.log("RES THEN CALLED")
//             self._reset_state();
//         });
//     }

//     willUnmount() {
//         super.willUnmount()
//     }

//     async getOrdersFromBackEnd() {
//         await this.getOrdersData()
//         this.render()
//     }

//     back() {
//         if (this.state.detailIsShown || this.state.productSyncPageIsShown) {
//             this.state.detailIsShown = false;
//             this.state.productSyncPageIsShown = false;
//             this.render();
//         } else {
//             this.props.resolve({ confirmed: false, payload: false });
//             this.trigger('close-temp-screen');
//         }
//     }

//     confirm() {
//         this.props.resolve({ confirmed: true, payload: this.state.selectedMove });
//         this.trigger('');
//     }

//     get getMoves() {
//         return JSON.parse(window.localStorage.getItem("livedata"));
//     }

//     get isNextButtonVisible() {
//         return this.state.selectedMove ? true : false;
//     }

//     // Methods

//     // We declare this event handler as a debounce function in
//     // order to lower its trigger rate.
//     updateOrderList(event) {
//         this.state.query = event.target.value;
//         // const clients = this.clients;
//         // if (event.code === 'Enter' && clients.length === 1) {
//         //     this.state.selectedMove = clients[0];
//         //     this.clickNext();
//         // } else {
//         //     this.render();
//         // }
//     }

//     isItemSelected(status_code, order_status_code) {
//         if (order_status_code >= status_code) {
//             return true;
//         }
//         else {
//             return false;
//         }
//     }

//     async clickCartButton(event) {
//         // this.trigger('zmallClickProduct', this.zmallproduct);
//         console.log("=======>>> clickCartButton");
//         console.log(event);
//         let list = [];

//         for (let index = 0; index < event.cart_items.length; index++) {
//             const item = event.cart_items[index];
//             let category_name = item['category_name'];
//             let itemname = item['full_product_name'];
//             let unique_id = item['unique_id'];
//             let note_for_item = item['note_for_item'];

//             let text = "[" + category_name + "] " + itemname;
//             if(note_for_item != ""){
//                 text = text + " Note => " + note_for_item;
//             }
//             list.push(
//                 {
//                     'id': unique_id,
//                     'name': text,
//                     'item': index,
//                     'category_name': category_name,
//                     'itemname': itemname,
//                     'note': note_for_item
//                 }
//             );

//         }

//         // await this.showPopup('PopUpCreateMrpOrder', {
//         //     title: this.env._t('Modifiers BOM and Create MRP Order'),
//         //     items: bom_lines_set
//         // });

//         await this.showPopup('PopUpZmallCart', {
//             confirmText: 'Change Status',
//             cancelText: 'Close',
//             title: 'Order Cart',
//             items: list
//         });

//     }

//     async clickOrderLine(event) {
//         let self = this;
//         console.log("============ORDER_CLICK============");
//         console.log(event);
//         let order_status_code = event.order_status;

//         await this.showPopup('SelectionPopup', {
//             title: this.env._t('Change Order Status'),
//             list: [
//                 {
//                     id: 1,
//                     item: 1,
//                     label: "New",
//                     imageUrl: "/pos_zmall/static/description/created.png",
//                     isSelected: this.isItemSelected(1, event.order_status)
//                 },
//                 {
//                     id: 3,
//                     item: 3,
//                     label: "Accepted",
//                     imageUrl: "/pos_zmall/static/description/accepted.png",
//                     isSelected: this.isItemSelected(3, event.order_status)
//                 },
//                 {
//                     id: 5,
//                     item: 5,
//                     label: "Prepared",
//                     imageUrl: "/pos_zmall/static/description/prepared.png",
//                     isSelected: this.isItemSelected(5, event.order_status)
//                 },
//                 {
//                     id: 7,
//                     item: 7,
//                     label: "Ready",
//                     imageUrl: "/pos_zmall/static/description/ready.png",
//                     isSelected: this.isItemSelected(7, event.order_status)
//                 }
//             ]
//         }).then(async (selectedstatus) => {
//             if (selectedstatus) {
//                 if (selectedstatus.payload <= order_status_code) {
//                     await this.showPopup('ErrorPopup', {
//                         title: this.env._t('Invalid Action'),
//                         body: this.env._t('Can not revert back to status that has been passed')
//                     })
//                 }
//                 else {
//                     let { confirmed, payload: result } = await this.showPopup('ConfirmPopup', {
//                         title: this.env._t('Confirmation'),
//                         body: this.env._t('Please double check because this step can not be reversed?')
//                     })
//                     if (confirmed) {
//                         let storeId = window.localStorage.getItem("store_id");
//                         let serverToken = window.localStorage.getItem("server_token");
//                         console.log("CHANGE ORDER STATUS");
//                         console.log("Order ID => " + event.zmall_order_id + " TO Status => " + selectedstatus.payload);
//                         // console.log({
//                         //     "order_id": event.zmall_order_id,
//                         //     "order_status": selectedstatus.payload,
//                         //     "server_token": serverToken,
//                         //     "store_id": storeId
//                         // });
//                         let data = {
//                             "config_id": this.env.pos.config_id,
//                             "order_id": event.zmall_order_id,
//                             "order_status": selectedstatus.payload,
//                             "server_token": serverToken,
//                             "store_id": storeId
//                         };

//                         let changestatresult = await self.setOrdersStatus(data);
//                         // await self.setOrdersStatus(data).then(async (selectedstatus) => {

//                         // });

//                         console.log("===================== setOrdersStatus result =====================");
//                         console.log(changestatresult);
//                         console.log("===================== setOrdersStatus result =====================");

//                         if (changestatresult) {
//                             self.env.pos.alert_message({
//                                 title: self.env._t('Info'),
//                                 body: self.env._t('Status Changed Successfully'),
//                             });
//                         }
//                         else {
//                             self.env.pos.alert_message({
//                                 title: self.env._t('Warning'),
//                                 body: self.env._t('Error Occured Stauts Not Changed'),
//                             });
//                         }
//                     }
//                 }
//             }

//         });
//     }

//     clickNext() {
//         this.state.selectedMove = this.nextButton.command === 'set' ? this.state.selectedMove : null;
//         this.confirm();
//     }

//     clearSearch() {
//         this._initializeSearchFieldConstants()
//         this.filter = this.filterOptions[0];
//         this.searchDetails = {};
//         this.moves = this.env.pos.db.get_invoices()
//         this.getOrdersFromBackEnd()
//     }


//     // TODO: ==================== Seach bar example ====================

//     get searchBarConfig() {
//         return {
//             searchFields: this.constants.searchFieldNames,
//             filter: { show: true, options: this.filterOptions },
//         };
//     }

//     // TODO: define search fields
//     get _searchFields() {
//         return {} // TODO: 15.07.2021 turnoff it, automatic search when cashier typing searchbox
//         // var fields = {
//         //     'Number': (order) => order.name,
//         //     Customer: (order) => order.partner_id[1],
//         //     'Customer Reference': (order) => order.ref,
//         //     'Payment Reference': (order) => order.payment_reference,
//         //     'Sale Person': (order) => order.invoice_user_id[1],
//         //     'Invoice Date (YYYY-MM-DD)': (order) => moment(order.invoice_date).format('YYYY-MM-DD hh:mm A'),
//         //     'Invoice Due Date (YYYY-MM-DD)': (order) => moment(order.invoice_date_due).format('YYYY-MM-DD hh:mm A'),
//         //     ID: (order) => order.id,
//         // };
//         // return fields;
//     }

//     // TODO: define group filters
//     get filterOptions() { // list state for filter
//         return [
//             'All Items',
//             'New',
//             'Accepted',
//             'Prepared',
//             'Ready',
//         ];
//     }

//     get _stateSelectionFilter() {
//         return {
//             draft: 'New',
//             accepted: 'Accepted',
//             prepared: 'Prepared',
//             ready: 'Ready',
//         };
//     }

//     // TODO: register search bar
//     _initializeSearchFieldConstants() {
//         this.constants = {};
//         Object.assign(this.constants, {
//             searchFieldNames: Object.keys(this._searchFields),
//             stateSelectionFilter: this._stateSelectionFilter,
//         });
//     }

//     // TODO: save filter selected on searchbox of user for getOrders()
//     _onFilterSelected(event) {
//         this.filter = event.detail.filter;
//         this.render();
//     }

//     // TODO: save search detail selected on searchbox of user for getOrders()
//     _onSearch(event) {
//         const searchDetails = event.detail;
//         Object.assign(this.searchDetails, searchDetails);
//         this.render();
//     }
    
//     _eventKeyupSearchOrder(event) {
//         const searchInput = event.detail
//         if (searchInput != "") {
//             this.moves = this.env.pos.db.search_invoice(searchInput)
//         } else {
//             this.moves = this.env.pos.db.get_invoices()
//         }
//         this.render()
//     }

//     // TODO: return orders of system
//     get moveList() {
//         return this.moves
//     }
// }

// // DeliveryOrdersScreen.template = 'DeliveryOrdersScreen';
// // registry.add('DeliveryOrdersScreen');
// registry.category("pos_screens").add("DeliveryOrdersScreen", DeliveryOrdersScreen);

// // registry.category("pos_screens").add("DeliveryOrdersScreen", DeliveryOrdersScreen);



































// import { _t } from "@web/core/l10n/translation";
// import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";
// import { useService } from "@web/core/utils/hooks";
// import { TextAreaPopup } from "@point_of_sale/app/utils/input_popups/textarea_popup";
// import { Component } from "@odoo/owl";



// import { Component, useState } from "@odoo/owl";
// import { useService } from "@web/core/utils/hooks";

// import { _t } from "@web/core/l10n/translation";
// import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";
// import { useService } from "@web/core/utils/hooks";
// import { TextAreaPopup } from "@point_of_sale/app/utils/input_popups/textarea_popup";
// import { Component } from "@odoo/owl";


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


    // const { useState } = owl;
    // const { debounce } = owl.utils;
    // const PosComponent = require('point_of_sale.PosComponent');
    // const Registries = require('point_of_sale.Registries');
    // const { useListener } = require('web.custom_hooks');

// export  class DeliveryOrdersScreen extends PosComponent {
//         static template = "pos_etta.DeliveryOrdersScreen";
//         constructor() {
//             super(...arguments);
//             this.state = {
//                 moves: this.env.pos.db.get_invoices(),
//                 query: null,
//                 selectedMove: this.props.move,
//                 detailIsShown: false,
//                 productSyncPageIsShown: false,
//                 isEditMode: false,
//                 editModeProps: {
//                     move: null
//                 },
//                 loading: false,
//             };
//             this.updateOrderList = debounce(this.updateOrderList, 70);
//             useListener('setloading', this.setLoading);
//             useListener('authzmall', this.authZmall);
//             useListener('filter-selected', this._onFilterSelected);
//             useListener('search', this._onSearch);
//             useListener('event-keyup-search-order', this._eventKeyupSearchOrder);
//             this.searchDetails = {};
//             this.filter = null;
//             this._initializeSearchFieldConstants();
//             this.moves = this.env.pos.db.get_invoices();

//             this.loading = false;
//             // this.zmallproduct = [];
//             //check if zmall product exists
//             this.checkZmallProductExist();

//         }

//         async checkZmallProductExist() {
//             let self = this;
//             return await this.rpc({
//                 model: 'product.product',
//                 method: 'search_read',
//                 args: [[['default_code', '=', 'ZMALL_001']]]
//             }).then(async function (zmall_product_value) {
//                 console.log("======== >>>>>>>>>> checkZmallProductExist");
//                 console.log(zmall_product_value);
//                 if (zmall_product_value.length == 0) {
//                     await self.loadZmallProduct()
//                 }
//                 else {
//                     // this.zmallproduct = zmall_product_value[0];
//                 }
//                 // return values;
//             }, function (err) {
//                 return err;
//             });
//         }

//         async loadZmallProduct() {
//             await this.rpc({
//                 'route': '/pos_zmall/load_zmall_data',
//             });
//         }

//         get isloading() {
//             return this.state.loading;
//         }

//         getElapsedTime(created_at) {
//             var dateString = created_at;
//             var currentDate = new Date();
//             var elapsedTime = currentDate - new Date(dateString);
//             // Convert to seconds
//             var seconds = elapsedTime / 1000;

//             // Convert to minutes
//             var minutes = seconds / 60;

//             // Convert to hours
//             var hours = minutes / 60;

//             // Convert to days
//             var days = hours / 24;

//             if (seconds < 60) {
//                 return seconds > 1 ? Number(seconds).toFixed() + " secs ago" : Number(seconds).toFixed() + " sec ago"
//             }
//             else if (seconds > 60 && seconds < 3600) {
//                 return minutes > 1 ? Number(minutes).toFixed() + " mins ago" : Number(minutes).toFixed() + " min ago"
//             }
//             else if (seconds > 3600 && seconds < 86400) {
//                 return hours > 1 ? Number(hours).toFixed() + " hours ago" : Number(hours).toFixed() + " hour ago"
//             }
//             else if (seconds > 86400) {
//                 return days > 1 ? Number(days).toFixed() + " days ago" : Number(days).toFixed() + " day ago"
//             }
//         }

//         setLoading(loading) {
//             // const overlay = document.getElementById('loading-overlay');
//             this.state.loading = loading;
//             if (loading) {
//                 // document.getElementById('loading-overlay').style.display = 'flex';
//             } else {
//                 // document.getElementById('loading-overlay').style.display = 'none';
//             }
//         }

        // openCompanyProfile() {
        //     if (this.state.productSyncPageIsShown) {
        //         this.state.productSyncPageIsShown = false;
        //     }
        //     this.state.detailIsShown = true;
        //     this.render();
        // }

        // openProductsPage() {
        //     console.log("================= openProductsPage")
        //     if (this.state.detailIsShown) {
        //         this.state.detailIsShown = false;
        //     }
        //     this.state.productSyncPageIsShown = true;

        //     console.log(this.state.productSyncPageIsShown);
        //     console.log(this.state.detailIsShown);
        //     this.render();
        // }

        // async authZmall() {
        //     let self = this;
        //     self.setLoading(true);
        //     await this.rpc({
        //         model: 'pos.config',
        //         method: 'auth_zmall',
        //         args:
        //             [this.env.pos.config_id],
        //         context: {
        //             pos: true
        //         }
        //     }).then(function (values) {
        //         self.setLoading(false);
        //         window.localStorage.setItem("server_token", values.server_token);
        //         window.localStorage.setItem("store_id", values.store_id);
        //         console.log("ZMALL RESPOSNSE");
        //         console.log(values);
        //         return values;
        //     }, function (err) {
        //         self.setLoading(false);
        //         return err;
        //     });
        // }

        // async getOrdersData() {
        //     let self = this;
        //     await this.authZmall();
        //     self.setLoading(true);
        //     let storeId = window.localStorage.getItem("store_id");
        //     let serverToken = window.localStorage.getItem("server_token");
        //     console.log("storeId" + storeId);
        //     console.log("serverToken" + serverToken);
        //     let requestData = {
        //         "config_id": this.env.pos.config_id,
        //         "store_id": storeId,
        //         "server_token": serverToken
        //     }
        //     await this.rpc({
        //         model: 'pos.config',
        //         method: 'get_zmall_orders',
        //         args: [[], requestData],
        //         context: {
        //             pos: true
        //         }
        //     }).then(function (values) {
        //         self.setLoading(false);
        //         console.log("ZMALL ORDERS RESPOSNSE");
        //         console.log(values);
        //         window.localStorage.setItem("livedata", JSON.stringify(values));
        //         // this.state.zmallorders = values;
        //         return values;
        //     }, function (err) {
        //         self.setLoading(false);
        //         console.log("=========err=========");
        //         console.log(err);
        //         return err;
        //     });
        // }

        // async setOrdersStatus(data) {
        //     let self = this;
        //     self.setLoading(true);
        //     console.log("======================= setOrdersStatus data =======================")
        //     console.log(data)
        //     console.log("======================= setOrdersStatus data =======================")
        //     await this.rpc({
        //         model: 'pos.config',
        //         method: 'set_zmall_order_status',
        //         args: [[], data],
        //         context: {
        //             pos: true
        //         }
        //     }).then(async function (value) {
        //         self.setLoading(false);
        //         console.log("======================= setOrdersStatus value =======================")
        //         console.log(value)
        //         console.log("======================= setOrdersStatus value =======================")
        //         if (value === "reauth") {
        //             //auth
        //             await self.authZmall();
        //             let newstoreId = window.localStorage.getItem("store_id");
        //             let newserverToken = window.localStorage.getItem("server_token");
        //             let newdata = {
        //                 "order_id": data["order_id"],
        //                 "order_status": data["order_status"],
        //                 "server_token": newserverToken,
        //                 "store_id": newstoreId
        //             }
        //             return await self.setOrdersStatus(newdata);
        //         }

        //         if (value === "done") {
        //             //refrease or show done message
        //             console.log("value => " + value);
        //             self.getOrdersFromBackEnd();
        //             return true;
        //         }

        //         if (value === "error") {
        //             //unknown error message
        //             console.log("value => " + value);
        //             self.getOrdersFromBackEnd();
        //             return false;
        //         }
        //         return value;
        //     }, function (err) {
        //         self.setLoading(false);
        //         console.log("=========err=========");
        //         console.log(err);
        //         return err;
        //     });
        // }

        // _reset_state() {
        //     console.log(" ============ _reset_state ============ ")
        //     this.was_cancelled = false;
        //     this.last_diagnosis_service_id = false;
        //     this.remaining_polls = 4;
        //     clearTimeout(this.polling);
        // }

        // mounted() {
        //     super.mounted()
        //     let self = this;

        //     var res = new Promise(function (resolve, reject) {
        //         clearTimeout(self.polling);

        //         self.polling = setInterval(function () {
        //             console.log('_poll_for_zmall_response');

        //             if (this.was_cancelled) {
        //                 console.log('was_cancelled');

        //                 resolve(false);
        //                 return Promise.resolve();
        //             }

        //             self.getOrdersFromBackEnd().catch(function (data) {
        //                 if (self.remaining_polls != 0) {
        //                     self.remaining_polls--;
        //                 } else {
        //                     reject();
        //                     // self.poll_error_order = self.pos.get_order();
        //                     return self._handle_odoo_connection_failure(data);
        //                 }
        //                 return Promise.reject(data);
        //             }).then(function (status) {
        //                 console.log("ROSOLVED")
        //                 resolve(true);
        //                 self.render();
        //             });

        //         }, 5000);
        //     });

        //     // make sure to stop polling when we're done
        //     res.then(function () {
        //         console.log("RES THEN CALLED")
        //         self._reset_state();
        //     });
        // }

        // willUnmount() {
        //     super.willUnmount()
        // }

        // async getOrdersFromBackEnd() {
        //     await this.getOrdersData()
        //     this.render()
        // }

        // back() {
        //     if (this.state.detailIsShown || this.state.productSyncPageIsShown) {
        //         this.state.detailIsShown = false;
        //         this.state.productSyncPageIsShown = false;
        //         this.render();
        //     } else {
        //         this.props.resolve({ confirmed: false, payload: false });
        //         this.trigger('close-temp-screen');
        //     }
        // }

        // confirm() {
        //     this.props.resolve({ confirmed: true, payload: this.state.selectedMove });
        //     this.trigger('');
        // }

        // get getMoves() {
        //     return JSON.parse(window.localStorage.getItem("livedata"));
        // }

        // get isNextButtonVisible() {
        //     return this.state.selectedMove ? true : false;
        // }

        // // Methods

        // // We declare this event handler as a debounce function in
        // // order to lower its trigger rate.
        // updateOrderList(event) {
        //     this.state.query = event.target.value;
        //     // const clients = this.clients;
        //     // if (event.code === 'Enter' && clients.length === 1) {
        //     //     this.state.selectedMove = clients[0];
        //     //     this.clickNext();
        //     // } else {
        //     //     this.render();
        //     // }
        // }

        // isItemSelected(status_code, order_status_code) {
        //     if (order_status_code >= status_code) {
        //         return true;
        //     }
        //     else {
        //         return false;
        //     }
        // }

        // async clickCartButton(event) {
        //     // this.trigger('zmallClickProduct', this.zmallproduct);
        //     console.log("=======>>> clickCartButton");
        //     console.log(event);
        //     let list = [];

        //     for (let index = 0; index < event.cart_items.length; index++) {
        //         const item = event.cart_items[index];
        //         let category_name = item['category_name'];
        //         let itemname = item['full_product_name'];
        //         let unique_id = item['unique_id'];
        //         let note_for_item = item['note_for_item'];

        //         let text = "[" + category_name + "] " + itemname;
        //         if(note_for_item != ""){
        //             text = text + " Note => " + note_for_item;
        //         }
        //         list.push(
        //             {
        //                 'id': unique_id,
        //                 'name': text,
        //                 'item': index,
        //                 'category_name': category_name,
        //                 'itemname': itemname,
        //                 'note': note_for_item
        //             }
        //         );

        //     }

        //     // await this.showPopup('PopUpCreateMrpOrder', {
        //     //     title: this.env._t('Modifiers BOM and Create MRP Order'),
        //     //     items: bom_lines_set
        //     // });

        //     await this.showPopup('PopUpZmallCart', {
        //         confirmText: 'Change Status',
        //         cancelText: 'Close',
        //         title: 'Order Cart',
        //         items: list
        //     });

        // }

        // async clickOrderLine(event) {
        //     let self = this;
        //     console.log("============ORDER_CLICK============");
        //     console.log(event);
        //     let order_status_code = event.order_status;

        //     await this.showPopup('SelectionPopup', {
        //         title: this.env._t('Change Order Status'),
        //         list: [
        //             {
        //                 id: 1,
        //                 item: 1,
        //                 label: "New",
        //                 imageUrl: "/pos_zmall/static/description/created.png",
        //                 isSelected: this.isItemSelected(1, event.order_status)
        //             },
        //             {
        //                 id: 3,
        //                 item: 3,
        //                 label: "Accepted",
        //                 imageUrl: "/pos_zmall/static/description/accepted.png",
        //                 isSelected: this.isItemSelected(3, event.order_status)
        //             },
        //             {
        //                 id: 5,
        //                 item: 5,
        //                 label: "Prepared",
        //                 imageUrl: "/pos_zmall/static/description/prepared.png",
        //                 isSelected: this.isItemSelected(5, event.order_status)
        //             },
        //             {
        //                 id: 7,
        //                 item: 7,
        //                 label: "Ready",
        //                 imageUrl: "/pos_zmall/static/description/ready.png",
        //                 isSelected: this.isItemSelected(7, event.order_status)
        //             }
        //         ]
        //     }).then(async (selectedstatus) => {
        //         if (selectedstatus) {
        //             if (selectedstatus.payload <= order_status_code) {
        //                 await this.showPopup('ErrorPopup', {
        //                     title: this.env._t('Invalid Action'),
        //                     body: this.env._t('Can not revert back to status that has been passed')
        //                 })
        //             }
        //             else {
        //                 let { confirmed, payload: result } = await this.showPopup('ConfirmPopup', {
        //                     title: this.env._t('Confirmation'),
        //                     body: this.env._t('Please double check because this step can not be reversed?')
        //                 })
        //                 if (confirmed) {
        //                     let storeId = window.localStorage.getItem("store_id");
        //                     let serverToken = window.localStorage.getItem("server_token");
        //                     console.log("CHANGE ORDER STATUS");
        //                     console.log("Order ID => " + event.zmall_order_id + " TO Status => " + selectedstatus.payload);
        //                     // console.log({
        //                     //     "order_id": event.zmall_order_id,
        //                     //     "order_status": selectedstatus.payload,
        //                     //     "server_token": serverToken,
        //                     //     "store_id": storeId
        //                     // });
        //                     let data = {
        //                         "config_id": this.env.pos.config_id,
        //                         "order_id": event.zmall_order_id,
        //                         "order_status": selectedstatus.payload,
        //                         "server_token": serverToken,
        //                         "store_id": storeId
        //                     };

        //                     let changestatresult = await self.setOrdersStatus(data);
        //                     // await self.setOrdersStatus(data).then(async (selectedstatus) => {

        //                     // });

        //                     console.log("===================== setOrdersStatus result =====================");
        //                     console.log(changestatresult);
        //                     console.log("===================== setOrdersStatus result =====================");

        //                     if (changestatresult) {
        //                         self.env.pos.alert_message({
        //                             title: self.env._t('Info'),
        //                             body: self.env._t('Status Changed Successfully'),
        //                         });
        //                     }
        //                     else {
        //                         self.env.pos.alert_message({
        //                             title: self.env._t('Warning'),
        //                             body: self.env._t('Error Occured Stauts Not Changed'),
        //                         });
        //                     }
        //                 }
        //             }
        //         }

        //     });
        // }

        // clickNext() {
        //     this.state.selectedMove = this.nextButton.command === 'set' ? this.state.selectedMove : null;
        //     this.confirm();
        // }

        // clearSearch() {
        //     this._initializeSearchFieldConstants()
        //     this.filter = this.filterOptions[0];
        //     this.searchDetails = {};
        //     this.moves = this.env.pos.db.get_invoices()
        //     this.getOrdersFromBackEnd()
        // }


        // // TODO: ==================== Seach bar example ====================

        // get searchBarConfig() {
        //     return {
        //         searchFields: this.constants.searchFieldNames,
        //         filter: { show: true, options: this.filterOptions },
        //     };
        // }

        // // TODO: define search fields
        // get _searchFields() {
        //     return {} // TODO: 15.07.2021 turnoff it, automatic search when cashier typing searchbox
        //     // var fields = {
        //     //     'Number': (order) => order.name,
        //     //     Customer: (order) => order.partner_id[1],
        //     //     'Customer Reference': (order) => order.ref,
        //     //     'Payment Reference': (order) => order.payment_reference,
        //     //     'Sale Person': (order) => order.invoice_user_id[1],
        //     //     'Invoice Date (YYYY-MM-DD)': (order) => moment(order.invoice_date).format('YYYY-MM-DD hh:mm A'),
        //     //     'Invoice Due Date (YYYY-MM-DD)': (order) => moment(order.invoice_date_due).format('YYYY-MM-DD hh:mm A'),
        //     //     ID: (order) => order.id,
        //     // };
        //     // return fields;
        // }

        // // TODO: define group filters
        // get filterOptions() { // list state for filter
        //     return [
        //         'All Items',
        //         'New',
        //         'Accepted',
        //         'Prepared',
        //         'Ready',
        //     ];
        // }

        // get _stateSelectionFilter() {
        //     return {
        //         draft: 'New',
        //         accepted: 'Accepted',
        //         prepared: 'Prepared',
        //         ready: 'Ready',
        //     };
        // }

        // // TODO: register search bar
        // _initializeSearchFieldConstants() {
        //     this.constants = {};
        //     Object.assign(this.constants, {
        //         searchFieldNames: Object.keys(this._searchFields),
        //         stateSelectionFilter: this._stateSelectionFilter,
        //     });
        // }

        // // TODO: save filter selected on searchbox of user for getOrders()
        // _onFilterSelected(event) {
        //     this.filter = event.detail.filter;
        //     this.render();
        // }

        // // TODO: save search detail selected on searchbox of user for getOrders()
        // _onSearch(event) {
        //     const searchDetails = event.detail;
        //     Object.assign(this.searchDetails, searchDetails);
        //     this.render();
        // }
        
        // _eventKeyupSearchOrder(event) {
        //     const searchInput = event.detail
        //     if (searchInput != "") {
        //         this.moves = this.env.pos.db.search_invoice(searchInput)
        //     } else {
        //         this.moves = this.env.pos.db.get_invoices()
        //     }
        //     this.render()
        // }

        // // TODO: return orders of system
        // get moveList() {
        //     return this.moves
        // }
//     }

//     // DeliveryOrdersScreen.template = 'DeliveryOrdersScreen';
//     // registry.add('DeliveryOrdersScreen');
//     registry.category("pos_screens").add("DeliveryOrdersScreen", DeliveryOrdersScreen);
    


    // Registries.Component.add(DeliveryOrdersScreen);

