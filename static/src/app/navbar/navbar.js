/** @odoo-module */

import { Navbar } from "@point_of_sale/app/navbar/navbar";
import { patch } from "@web/core/utils/patch";
import { _t } from "@web/core/l10n/translation";
import { FiscalReadingPopup } from "./FiscalReadingPopup/FiscalReadingPopup";
import { jsonrpc } from "@web/core/network/rpc_service";
import {DeliveryScreenWidget} from "../DeliveryOrders/DeliveryScreenWidget";
import {usePos} from "@point_of_sale/app/store/pos_hook";




patch(Navbar.prototype, {
    get isRefund() {
        if (this.pos != null) {
            if (this.pos.get_order() != null) {
                return this.pos.is_refund_order();
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    },
    get isAdvancedUserAccess() {
        return this.pos.get_cashier().role === 'manager';
    },
    turnOffRefund() {
        this.pos.set_is_refund_order(false);
    },
    turnOnRefund() {
        this.pos.set_is_refund_order(true);
    },
    async onClick() {
        await this.popup.add(FiscalReadingPopup, {
            title: _t("Add Products"),
            body: _t("Please add products before clicking Home delivery"),
        });
    },

    onPrintAllPlusClick() {
        let productDetails = [];
        for (let product of Object.values(this.pos.db.product_by_id)) {
            productDetails.push({
                'pluCode': product.default_code,
                'productName': product.display_name,
                'taxRate': product.taxes_id === undefined ? 0 : product.taxes_id.length > 0 ? this.pos.taxes_by_id[product.taxes_id[0]].amount : 0,
                'unitPrice': product.lst_price
            });
        }
        let jsonProductDetails = JSON.stringify(productDetails);
        console.log(jsonProductDetails);

        if (window.Android != undefined) {
            if (window.Android.isAndroidPOS()) {
                var result = window.Android.printTcp(jsonProductDetails);
                var responseObject = JSON.parse(result);
                if (responseObject.success) {
                    this.env.services.notification.add("Printing all PLU'S Successfull", {
                        type: 'info',
                        sticky: false,
                        timeout: 10000,
                    });
                }
                else {
                    this.env.services.notification.add("Printing ALl PLU's Failed", {
                        type: 'danger',
                        sticky: false,
                        timeout: 10000,
                    });
                }
            }
        }      
        return jsonProductDetails;
    },
    onCompanyProfileClicked(){

        this.pos.showScreen("CompanyProfile");
    },
    onDeliveryChromeClicked(){
        this.pos.showScreen("DeliveryScreenWidget");

    },
    onDeliveryOrderRowClicked(){
        this.pos.showScreen("DeliveryOrderRow");

    },
    onDeliveryOrderScreenClicked(){
        this.pos.showScreen("DeliveryOrdersScreen");

    },
    onDeliveryScreenWidgetClicked(){
        this.pos.showScreen("DeliveryScreenWidget");

    },


    onProductSyncClicked(){
        this.pos.showScreen("ProductSync");

    },
    onZmallClicked() {
        this.pos.showScreen("DeliveryScreenWidget");
    },

    onPrintAllTaxRates() {
        let taxesList = [];
        for (let tax of Object.values(this.pos.taxes_by_id)) {
            if (tax.type_tax_use === 'sale') {
                let taxInfo = {
                    'name': tax.name,
                    'amount': tax.amount,
                };
                taxesList.push(taxInfo);
            }
        }

        let jsonTaxes = JSON.stringify(taxesList);
        console.log(jsonTaxes);

        if (window.Android != undefined) {
            if (window.Android.isAndroidPOS()) {
                var result = window.Android.printTcp(jsonTaxes);
                var responseObject = JSON.parse(result);
                if (responseObject.success) {
                    this.env.services.notification.add("Printing all Tax Rates Successfull", {
                        type: 'info',
                        sticky: false,
                        timeout: 10000,
                    });
                }
                else {
                    this.env.services.notification.add("All Tax Rates Printing Failed", {
                        type: 'danger',
                        sticky: false,
                        timeout: 10000,
                    });
                }
            }
        }

        return jsonTaxes;
    },
    async onZReportClick() {
        if (window.Android != undefined) {
            if (window.Android.isAndroidPOS()) {
                var result = window.Android.printZReport();
                var responseObject = JSON.parse(result);

                if (responseObject.success) {
                    this.env.services.notification.add("Z Report Printed", {
                        type: 'info',
                        sticky: false,
                        timeout: 10000,
                    });
                }
                else {
                    this.env.services.notification.add("Z Report Printing Failed", {
                        type: 'danger',
                        sticky: false,
                        timeout: 10000,
                    });
                }
            }
        }
    },
    async onXReportClick() {
        if (window.Android != undefined) {
            if (window.Android.isAndroidPOS()) {
                var result = window.Android.printXReport();
                var responseObject = JSON.parse(result);
                if (responseObject.success) {
                    this.env.services.notification.add("X Report Printed", {
                        type: 'info',
                        sticky: false,
                        timeout: 10000,
                    });
                }
                else {
                    this.env.services.notification.add("X Report Printing Failed", {
                        type: 'danger',
                        sticky: false,
                        timeout: 10000,
                    });
                }
            }
        }
    },
});

