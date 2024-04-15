/** @odoo-module **/
// import { Component } from "@odoo/owl";
// import { Component } from "@odoo/owl";
import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { jsonrpc } from "@web/core/network/rpc_service";




// const {getDataURLFromFile} = require('web.utils');
// const PosComponent = require('point_of_sale.PosComponent');
// const Registries = require('point_of_sale.Registries');
// const {useListener} = require('web.custom_hooks');
// const models = require('point_of_sale.models');
// const core = require('web.core');
// const qweb = core.qweb;
// const {posbus} = require('point_of_sale.utils');

class ProductSync extends Component {
        constructor() {
            super(...arguments);
            this.zmallproducts = [];
            this.posproducts = [];
            this.env.services.pos_bus.bus_service.addEventListener('actionConfirm', ({ detail }) => {
                console.log("actionConfirm")
                this.actionConfirm();
            });
            this.env.services.pos_bus.bus_service.addEventListener('actionPreview', ({ detail }) => {
                console.log("actionConfirm")
                this.actionPreview();
            });
            this.env.services.pos_bus.bus_service.addEventListener('actionPreview', ({ detail }) => {
                console.log("actionPreview")
                this.actionPreview();
            });
            this.env.services.pos_bus.bus_service.addEventListener('actionCancelEntry', ({ detail }) => {
                console.log("actionCancelEntry")
                this.actionCancelEntry();
            });
            this.env.services.pos_bus.bus_service.addEventListener('actionCancelEntry', ({ detail }) => {
                console.log("actionCancelEntry")
                this.actionResetDraft();
            });
            
            // useListener('actionConfirm', alert("sync from DB clicked"));
            //actionConfirm
            // console.log("=============props=============");
            // console.log(this.props);
        }
        setup(){
            super.setup();
          
            this.env.services.pos_bus.bus_service.addEventListener('actionConfirm', ({ detail }) => {
                console.log("actionConfirm")
                this.actionConfirm();
            });
            this.env.services.pos_bus.bus_service.addEventListener('actionPreview', ({ detail }) => {
                console.log("actionConfirm")
                this.actionPreview();
            });
            this.env.services.pos_bus.bus_service.addEventListener('actionPreview', ({ detail }) => {
                console.log("actionPreview")
                this.actionPreview();
            });
            this.env.services.pos_bus.bus_service.addEventListener('actionCancelEntry', ({ detail }) => {
                console.log("actionCancelEntry")
                this.actionCancelEntry();
            });
            this.env.services.pos_bus.bus_service.addEventListener('actionCancelEntry', ({ detail }) => {
                console.log("actionCancelEntry")
                this.actionResetDraft();
            });

        }

        async mounted(){
            await this.getZmallProducts();
            await this.getPosProducts();
            this.render();
        }

        get getFeatchedZmallProducts(){
            console.log("==============> getZmallProducts invoked")
            return this.zmallproducts;
        }

        get getproductsonpos(){
            console.log("==============> getproductsonpos invoked")
            console.log(this.posproducts);
            return this.posproducts;
        }

        async getZmallProducts() {
            console.log("==================== getZmallProducts ====================");
            let self = this;

            posbus.trigger('setloading', true);
            let storeId = window.localStorage.getItem("store_id");
            let serverToken = window.localStorage.getItem("server_token");

            let requestData = {
                "config_id": this.env.pos.config_id,
                "store_id": storeId,
                "server_token": serverToken,
                "type": 2
            }
            console.log("==================== requestData ====================");
            console.log(requestData);
            await this.rpc({
                model: 'pos.config',
                method: 'get_zmall_products',
                args: [[], requestData],
                context: {
                    pos: true
                }
            }).then(async function (value) {
                console.log("==================== requestData ====================");
                console.log(value);
                posbus.trigger('setloading', true);
                if (value === "reauth") {
                    //auth
                    await posbus.trigger('authzmall');
                    return await self.getZmallProducts();
                }
                else if (value === "error") {
                    //unknown error message
                    console.log("value => " + value);
                    return false;
                }
                else {
                    console.log("======================== STOREDATA ========================");
                    console.log(value);
                    self.zmallproducts = value;
                    return value;
                    // window.localStorage.setItem("store_name", value.store_name);
                    // window.localStorage.setItem("is_visible", value.is_visible);
                    // window.localStorage.setItem("is_business", value.is_business);
                    // window.localStorage.setItem("admin_profit_value_on_delivery", value.admin_profit_value_on_delivery);
                    // window.localStorage.setItem("is_store_busy", value.is_store_busy);
                    // window.localStorage.setItem("accept_only_cashless_payment", value.accept_only_cashless_payment);
                    // window.localStorage.setItem("accept_scheduled_order_only", value.accept_scheduled_order_only);
                }
            }, function (err) {
                posbus.trigger('setloading', true);
                console.log("=========err=========");
                console.log(err);
                return err;
            });
        }

        async getPosProducts() {
            console.log("==================== getPosProducts ====================");
            let self = this;
            
            await this.rpc({
                model: 'product.product',
                method: 'search_read',
                domain: [['sale_ok', '=', true], ['available_in_pos', '=', true]]
            }).then(async function (value) {
                console.log("======================== PRODUCTDATA ========================");
                console.log(value);
                self.posproducts = value;
            });
        }

        get storename(){
            return window.localStorage.getItem("store_name");
        }
        get isVisibile(){
            if(window.localStorage.getItem("is_visible")){
                return "Visible On ZMall"
            }
            else{
                return "Invisible On ZMall"
            }
        }
        get isInBusiness(){
            if(window.localStorage.getItem("is_business")){
                return "In Business"
            }
            else{
                return "Not Doing Business"
            }
        }
        get commissonRate(){
            return window.localStorage.getItem("admin_profit_value_on_delivery");
        }
        get isStoreBusy(){
            if(window.localStorage.getItem("is_store_busy")){
                return "Busy"
            }
            else{
                return "Not Busy"
            }
        }
        get cashlessOnly(){
            if(window.localStorage.getItem("accept_only_cashless_payment")){
                return "Cashless Only"
            }
            else{
                return "Cashless and Cash Payments"
            }
        }
        get scheduledOrderOnly(){
            if(window.localStorage.getItem("accept_scheduled_order_only")){
                return "Scheduled Orders Only"
            }
            else{
                return "Scheduled and Unscheduled Orders"
            }
        }

        async actionConfirm() {
            await jsonrpc('web/dataset/call_kw/account.move/',{
                model: 'account.move',
                method: 'action_post',
                args:
                    [[this.props.id]],
                context: {
                    pos: true
                }
            })
            await this.env.pos.getAccountMoves();
            var newMove = this.env.pos.db.invoice_by_id[this.props.id];
            this.props = newMove;
            this.render()
        }

        async setOrdersStatus(data) {
            let self = this;
            self.setLoading(true);
            console.log("======================= setOrdersStatus data =======================")
            console.log(data)
            console.log("======================= setOrdersStatus data =======================")
            await this.rpc({
                model: 'pos.config',
                method: 'set_zmall_order_status',
                args: [[], data],
                context: {
                    pos: true
                }
            }).then(async function (value) {
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
                    self.getOrdersFromBackEnd();
                    return true;
                }

                if (value === "error") {
                    //unknown error message
                    console.log("value => " + value);
                    self.getOrdersFromBackEnd();
                    return false;
                }
                return value;
            }, function (err) {
                self.setLoading(false);
                console.log("=========err=========");
                console.log(err);
                return err;
            });
        }

        async actionPreview() {
            const link = await this.rpc({
                model: 'account.move',
                method: 'preview_invoice',
                args:
                    [[this.props.id]],
                context: {
                    pos: true
                }
            })
            window.open(window.location.origin + link.url, '_blank')
        }

        async actionCancelEntry() {
            await this.rpc({
                model: 'account.move',
                method: 'button_cancel',
                args:
                    [[this.props.id]],
                context: {
                    pos: true
                }
            }, {
                shadow: true,
                timeout: 65000
            })
            await this.env.pos.getAccountMoves();
            var newMove = this.env.pos.db.invoice_by_id[this.props.id];
            this.props = newMove;
            this.render()
        }

        async actionResetDraft() {
            await this.rpc({
                model: 'account.move',
                method: 'button_draft',
                args:
                    [[this.props.id]],
                context: {
                    pos: true
                }
            }, {
                shadow: true,
                timeout: 65000
            })
            await this.env.pos.getAccountMoves();
            var newMove = this.env.pos.db.invoice_by_id[this.props.id];
            this.props = newMove;
            this.render()
        }

        get partnerImageUrl() {
            const move = this.props;
            const partner = move.partner_id
            if (partner) {
                return `/web/image?model=res.partner&id=${partner[0]}&field=image_128&unique=1`;
            } else {
                return false;
            }
        }

        get OrderUrl() {
            const move = this.props;
            return window.location.origin + "/web#id=" + move.id + "&view_type=form&model=account.move";
        }
        trigger(event) {

            console.log("event is triggered"+ ""+ event);
            this.env.services.pos_bus.bus_service.trigger(event);
            
        }
    }

    ProductSync.template = 'ProductSync';
    // registry.add(ProductSync);
    registry.category("pos_screens").add("ProductSync", ProductSync);

    // Registries.Component.add(ProductSync);
