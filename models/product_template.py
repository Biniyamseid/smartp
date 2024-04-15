from odoo import models, fields,api

class ProductTemplate(models.Model):
    _inherit = 'product.template'

    service_charge = fields.Float(string='Service Charge')
    zmall_id = fields.Char(string='Zmall ID', help="ID of product on zmall")
    default_code = fields.Char(
        'Internal Reference', compute='_compute_default_code',
        inverse='_set_default_code', store=True, required=True)

    single_tax_id = fields.Many2one(
        'account.tax', 
        string='Customer Tax',
        help="Default tax used when selling the product.",
        domain=[('type_tax_use', '=', 'sale')],
        default=lambda self: self.env.company.account_sale_tax_id,
    )

    @api.model
    def create(self, vals):
        if 'single_tax_id' in vals:
            vals['taxes_id'] = [(6, 0, [vals['single_tax_id']])]
        return super().create(vals)

    def write(self, vals):
        if 'single_tax_id' in vals:
            vals['taxes_id'] = [(6, 0, [vals['single_tax_id']])]
        return super().write(vals)
