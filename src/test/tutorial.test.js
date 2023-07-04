const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server-engine');
const expect = chai.expect;
const { faker } = require('@faker-js/faker');

chai.use(chaiHttp);

const createFakeData = () => {
    const result = {
        title: faker.commerce.product(),
        description: faker.commerce.productDescription(),
        published: faker.datatype.boolean(),
    };

    return result;
};

describe('API', () => {
    describe('POST /', () => {
        let fakeData;
        before(() => {
            fakeData = createFakeData();
        });
        context('with title', function () {
            it('should return the object', done => {
                // console.log(fakeData);
                chai.request(app)
                    .post('/api/tutorials')
                    .send(fakeData)
                    .end((err, res) => {
                        // console.log(err);
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.a('object');
                        done();
                    });
            });
        });
        context('without title', function () {
            it('should return the err', done => {
                // console.log(fakeData);
                chai.request(app)
                    .post('/api/tutorials')
                    .send({
                        title: 'name',
                        description: faker.commerce.productDescription(),
                        published: faker.datatype.boolean(),
                    })
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        done();
                    });
            });
        });
    });
    describe('GET /', () => {
        context('get all data', function () {
            it('should return the object', done => {
                chai.request(app)
                    .get('/api/tutorials')
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.be.a('object');
                        done();
                    });
            });
        });
        context('get published data', function () {
            it('should return the object', done => {
                chai.request(app)
                    .get('/api/tutorials/published')
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.be.a('object');
                        done();
                    });
            });
        });
        context('get data based on id', function () {
            it('should return the object', done => {
                chai.request(app)
                    .get('/api/tutorials/1')
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.be.a('object');
                        done();
                    });
            });
        });
    });
});
