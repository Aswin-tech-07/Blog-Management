const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../server-engine');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Authentication with login /', () => {
    describe('login check', () => {
        context('invalid login credentials', function () {
            it('should return 401 when invalid detail passed', done => {
                chai.request(app)
                    .post('/v1//user/login')
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        done();
                    });
            });
        });
        context('valid login credentials', function () {
            it('should return 200', done => {
                chai.request(app)
                    .post('/v1//user/login')
                    .send({
                        email: 'support@foloosi.com',
                        password: 'Foloosi@2023',
                    })
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        done();
                    });
            });
        });
    });
});
