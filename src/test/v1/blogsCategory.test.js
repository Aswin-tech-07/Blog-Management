const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../server-engine');
const expect = chai.expect;

chai.use(chaiHttp);

describe('GET /', () => {
    context('get all blog', function () {
        it('should return the object', done => {
            chai.request(app)
                .get('/v1/blog/list')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.a('object');
                    done();
                });
        });
    });
    context('get blog with details', function () {
        it('should return the object', done => {
            chai.request(app)
                .get('/v1/blog?q={"blog_no":"FLSBL603f5fe27fd39"}')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.a('object');
                    done();
                });
        });
        it('should return the error', done => {
            chai.request(app)
                .get('/v1/blog?q={"blog_no":""}')
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    done();
                });
        });
    });
});
