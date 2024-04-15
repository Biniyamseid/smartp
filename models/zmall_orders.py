from odoo import fields, models, api, _

import logging

import datetime
from odoo.http import request
import json, requests

_logger = logging.getLogger(__name__)


class PosZmallOrder(models.Model):
    _name = 'pos.zmall.order'
    _rec_name = "customer_name"
    
    zmall_order_id = fields.Char('Zmall Order ID')
    unique_id = fields.Char('Unique ID')
    created_at = fields.Datetime('Created Time')
    order_status = fields.Integer('Order Status')
    customer_name = fields.Char('Customer Name')
    total_cart_price = fields.Float('Total Order Price')
    state = fields.Float('Order State')
    cart_items = fields.One2many('pos.zmall.order.line', 'cart_id', ondelete='cascade', string='Order Lines')

class PosZmallOrderLine(models.Model):
    _name = "pos.zmall.order.line"
    _description = "Zmall Order Lines"
    _rec_name = "full_product_name"

    cart_id = fields.Many2one('pos.zmall.order', string='Order Ref', ondelete='cascade', required=True)
    unique_id = fields.Integer('Unique ID')
    category_name = fields.Char('Category Name', required=True)
    full_product_name = fields.Char('Product Name')
    note_for_item = fields.Char('Note')
    total_item_price = fields.Float('Total')