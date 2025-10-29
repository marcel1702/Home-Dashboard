const { prisma } = require('../utils/prisma');
const { v4: uuidv4 } = require('uuid');

function toDto(service) {
  return {
    id: service.id,
    title: service.title,
    description: service.description,
    internal_url: service.internal_url,
    external_url: service.external_url,
    position: service.position,
    enabled: service.enabled,
    created_at: service.created_at,
    updated_at: service.updated_at,
    icon: service.icon_blob
      ? `data:${service.icon_mime};base64,${service.icon_blob.toString('base64')}`
      : null,
  };
}

async function listPublicServices() {
  const records = await prisma.service.findMany({
    where: { enabled: true },
    orderBy: { position: 'asc' },
  });
  return records.map(toDto);
}

async function listAllServices() {
  const records = await prisma.service.findMany({
    orderBy: { position: 'asc' },
  });
  return records.map(toDto);
}

async function getMaxPosition() {
  const record = await prisma.service.findFirst({
    orderBy: { position: 'desc' },
  });
  return record ? record.position : 0;
}

async function createService(payload, icon) {
  const nextPosition = (await getMaxPosition()) + 1;
  const data = {
    id: uuidv4(),
    title: payload.title,
    description: payload.description || '',
    internal_url: payload.internal_url || null,
    external_url: payload.external_url || null,
    enabled: payload.enabled ?? true,
    position: nextPosition,
  };

  if (icon) {
    data.icon_blob = icon.buffer;
    data.icon_mime = icon.mimetype;
  }

  const created = await prisma.service.create({ data });
  return toDto(created);
}

async function updateService(id, payload, icon) {
  const data = {
    title: payload.title,
    description: payload.description || '',
    internal_url: payload.internal_url || null,
    external_url: payload.external_url || null,
  };

  if (typeof payload.enabled === 'boolean') {
    data.enabled = payload.enabled;
  }

  if (icon) {
    data.icon_blob = icon.buffer;
    data.icon_mime = icon.mimetype;
  }

  const updated = await prisma.service.update({
    where: { id },
    data,
  });
  return toDto(updated);
}

async function deleteService(id) {
  await prisma.service.delete({ where: { id } });
}

async function reorderServices(ids) {
  const updates = ids.map((id, index) =>
    prisma.service.update({
      where: { id },
      data: { position: index + 1 },
    })
  );
  await prisma.$transaction(updates);
  return listAllServices();
}

module.exports = {
  listPublicServices,
  listAllServices,
  createService,
  updateService,
  deleteService,
  reorderServices,
};
