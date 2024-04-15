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
import { debounce } from "@web/core/utils/timing";


import { hooks } from '@odoo/owl';


// const PosComponent = require('point_of_sale.PosComponent');
// const Registries = require('point_of_sale.Registries');

export class DeliveryOrderRow extends Component {
        constructor() {
            super(...arguments);
            console.log("====== DeliveryOrderRow props ======");
            console.log(this.props);
        }

        get highlight() {
            return this.props.move !== this.props.selectedMove ? '' : 'highlight';
        }

        get getElapsedTime() {
            var dateString = this.props.move.created_at;
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
                return seconds > 1 ? seconds + " secs ago" : seconds + " sec ago"
            }
            else if (seconds > 60) {
                return minutes > 1 ? minutes + " mins ago" : minutes + " min ago"
            }
            else if (seconds > 3600) {
                return hours > 1 ? hours + " hours ago" : hours + " hour ago"
            }
            else if (seconds > 86400) {
                return days > 1 ? days + " days ago" : days + " day ago"
            }
        }

        async _autoSyncBackend() {
            this.env.pos.set_synch('connecting', '')
            console.log('[_autoSyncBackend] Move ID: ' + this.props.move.id)
            let moves = await this.env.pos.getDatasByModel('account.move', [['id', '=', this.props.move.id]])
            if (moves != null) {
                if (moves.length == 1) {
                    this.props.move = moves[0]
                    this.render()
                } else {
                    console.warn('Move has deleted by backend: ' + this.props.move.id)
                }
            } else {
                this.env.pos.set_synch('disconnected', _t('Fail sync'))
            }
            let moveLines = await this.env.pos.getDatasByModel('account.move.line', [['move_id', '=', this.props.move.id]])
            if (moveLines != null) {
                this.props.move['lines'] = moveLines
            } else {
                this.env.pos.set_synch('disconnected', _t('Fail sync'))
            }
            this.env.pos.set_synch('connected', '')
        }
    }

    DeliveryOrderRow.template = 'DeliveryOrderRow';
    // registry.add(DeliveryOrderRow);
    registry.category("pos_screens").add("DeliveryOrderRow", DeliveryOrderRow);

    // Registries.Component.add(DeliveryOrderRow);

