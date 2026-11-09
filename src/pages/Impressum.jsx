import PageHero from '../components/PageHero'
import { company, legal } from '../data'

export default function Impressum() {
  return (
    <>
    <PageHero crumbs={[{ label: 'Company' }, { label: 'Imprint' }]} title="Impressum" text={`Company information and legal details for ${company.name}.`} />
    <section className="sheet">
      <div className="container split">
        <div className="legal">
          <dl>
            <dt>Company</dt><dd>{company.name}<br />{company.operator}</dd>
            <dt>Address</dt><dd>{company.street}<br />{company.city}, {company.country}</dd>
            <dt>General managers</dt><dd>{legal.managers}</dd>
            <dt>Phone</dt><dd>{company.phone}<br />Mobile: {company.mobile}</dd>
            <dt>Email</dt><dd><a href={`mailto:${company.email}`}>{company.email}</a></dd>
            <dt>Register court</dt><dd>{legal.court}, register no. {legal.register}</dd>
            <dt>VAT ID</dt><dd>{legal.vat}</dd>
          </dl>
        </div>
        <div className="promise prose">
          <span className="eyebrow">Data protection</span>
          <p>
            The controller responsible for data processing on this website under the GDPR is {company.operator},{' '}
            {company.street}, {company.city}, email <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a>.
          </p>
          <p>
            Online dispute resolution platform of the EU Commission:{' '}
            <a href={legal.odr} target="_blank" rel="noreferrer">{legal.odr}</a>. We are neither obliged nor willing to
            participate in dispute resolution proceedings before a consumer arbitration board.
          </p>
          <p>
            <a href={legal.privacyUrl} target="_blank" rel="noreferrer" className="link">Read the full data protection declaration</a>
          </p>
        </div>
      </div>
    </section>
    </>
  )
}
