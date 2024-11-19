const {ObjectId} = require('mongodb');

class ContactService {
  constructor(client) {
    this.Contact = client.db().collection('contacts');
  }
  //Dinh nghia cac phuong thuc truy xuat csdl, su dung mongodb api
  extractContactData(payload) {
    const contact = {
      name: payload.name,
      email: payload.email,
      address: payload.address,
      phone: payload.phone,
      favorite: payload.favorite,
    };
    Object.keys(contact).forEach(
      (key) => contact[key] === undefined && delete contact[key]
    );
    return contact;
  }
  async create(payload) {
    const contact = this.extractContactData(payload);
    try {
      const result = await this.Contact.findOneAndUpdate(
        contact,
        {$set: {favorite: contact.favorite === true}},
        {returnDocument: 'after', upsert: true}
      );
      if (result.error) {
        throw new Error('Database error');
      }
      return result.value;
    } catch (error) {
      throw new Error('An error occurred while creating contact');
    }
  }
  async find(filter) {
    const cursor = await this.Contact.find(filter);
    return await cursor.toArray();
  }
  async findByName(name) {
    return await this.find({
      name: {$regex: new RegExp(name, 'i')},
    });
  }
  async findById(id) {
    return await this.Contact.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }
  async update(id, document) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractContactData(document);
    const result = await this.Contact.findOneAndUpdate(
      filter,
      {$set: update},
      {returnDocument: 'after'}
    );
    // hoi Thay ve result va result.value
    return result;
  }
  async delete(id) {
    const result = await this.Contact.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async findFavorite() {
    return await this.find({favorite: true});
  }
  async deleteAll() {
    const result = await this.Contact.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = ContactService;
