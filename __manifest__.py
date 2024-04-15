# -*- coding: utf-8 -*-
{
    "name": "POS Fiscal ETTA",
    "summary": "Module for handeling fiscal printing with SUNMI devices",
    "author": "Melkam Zeyede",
    "version": "0.1",
    "depends": ["point_of_sale","account","sale"],
    'data': [
        # "import_libraries.xml",
        'views/res_config_settings_views.xml',
        'views/pos_order_view.xml',
        'views/product_template_view_extension.xml',
        'views/pos_order_report_view.xml',
        'views/account_move_line.xml',
        'views/sale_order.xml',
        'views/account_invoice_template_inherit.xml',
        'views/sale_order_template_inherit.xml',
        'security/ir.model.access.csv',
    ],
    "assets": {
        'point_of_sale._assets_pos': [
            'pos_etta/static/src/app/**/*',
        ],
        'point_of_sale.assets': [
            'pos_etta/static/src/app/control_button/*',
            'pos_etta/static/src/app/DeliveryOrders/*'

        ],

    },
    "qweb": [
        "static/src/app/DeliveryOrders/*.xml",
    ],
    "installable": True,
    "application": True,
    'license': 'LGPL-3',
}