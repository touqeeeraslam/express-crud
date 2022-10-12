const Role = require('../models/role');
const { __parse } = require('../shared/helper');


async function addRole(req, res, next) {

    try {
        const { name } = req.body;
        if (!name) {
            throw new Error('Role name is required.');
        }
        const role = new Role({ name });
        const createdRole = __parse(await role.save());
        res.status(200).json({ message: 'success', result: { data: createdRole } });
    } catch (error) {
        res.status(400).json({ message: error?.message });
    }
}

module.exports = { addRole };