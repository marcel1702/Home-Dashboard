const Joi = require('joi');

const urlSchema = Joi.string().uri({ scheme: ['http', 'https'] });

const servicePayloadSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  description: Joi.string().allow('').max(200).optional(),
  internal_url: urlSchema.allow('', null),
  external_url: urlSchema.allow('', null),
  enabled: Joi.boolean().optional(),
});

const reorderSchema = Joi.array().items(Joi.string().uuid()).min(1);

const loginSchema = Joi.object({
  password: Joi.string().min(8).max(128).required(),
});

module.exports = {
  servicePayloadSchema,
  reorderSchema,
  loginSchema,
};
