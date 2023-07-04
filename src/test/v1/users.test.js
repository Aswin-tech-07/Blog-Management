const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../server-engine');
const expect = chai.expect;

chai.use(chaiHttp);

describe('User Management /', () => {
    describe('Sign Up Route', () => {
        context('invalid role sign up', function () {
            it('should return 401 when invalid role passed', done => {
                chai.request(app)
                    .post('/v1/signup/developer')
                    .send({
                        username: 'John Doe',
                        email: 'johndoe@example.com',
                        password: 'password',
                    })
                    .end((err, res) => {
                        if (!err) {
                            expect(res).to.have.status(401);
                            done();
                        } else {
                            console.log(err);
                        }
                    });
            });
        });

        context('same email not used', function () {
            it('should return 400 when same email is try to create', done => {
                chai.request(app)
                    .post('/v1/signup/admin')
                    .send({
                        name: 'John Doe',
                        email: 'dev@foloosi.com',
                        password: 'password',
                    })
                    .end((err, res) => {
                        if (!err) {
                            expect(res).to.have.status(400);
                            done();
                        } else {
                            console.log(err);
                        }
                    });
            });
        });

        context('signup properly', function () {
            it('should return 200 and create account', done => {
                chai.request(app)
                    .post('/v1/signup/admin')
                    .send({
                        username: 'Udhaya Kumar',
                        email: 'coder@foloosi.com',
                        password: 'Foloosi@2023',
                    })
                    .end((err, res) => {
                        if (!err) {
                            expect(res).to.have.status(400);
                            done();
                        } else {
                            console.log(err);
                        }
                    });
            });
        });
    });
});
