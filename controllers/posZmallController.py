# -*- coding: utf-8 -*-
import json
import logging
import werkzeug.utils

from odoo import http
from odoo.http import request
from odoo.osv.expression import AND
from odoo.tools import convert

_logger = logging.getLogger(__name__)


class PosZmallController(http.Controller):

    @http.route('/pos_zmall/load_zmall_data', type='json', auth='user')
    def load_zmall_data(self):
        # convert.convert_file(request.env.cr, 'pos_zmall', 'data/point_of_sale_zmall.xml', None, mode='init', kind='data')
        convert.convert_file(request.env, 'pos_zmall', 'data/point_of_sale_zmall.xml', None, mode='init', kind='data')