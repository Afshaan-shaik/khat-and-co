import React, { useState } from 'react';
import { sfx } from '../utils/sound';
import { renderWaxSealSvg } from '../constants/waxSeal';
import { renderPostageStampSvg, renderPostmarkSvg } from '../utils/stamps';

export const HeroSection: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleHeroEnvelope = () => {
    if (!isOpen) {
      sfx.snap();
      setIsOpen(true);
      setTimeout(() => sfx.rustle(), 520);
    } else {
      sfx.thump();
      setIsOpen(false);
    }
  };

  return (
    <section className="hero">
      <div className="container">
        <div className="row g-5 align-items-center">
          <div className="col-12 col-lg-6">
            <h1>Letters for the people you miss.</h1>
            <p className="lead">
              Write on warm paper, seal it with wax, and send a link that opens like an envelope.
            </p>
            <p className="hindi" lang="hi">
              अपनों को खत लिखिए
            </p>
            <div className="hero-cta">
              <a className="btn cta lg" href="#studio">
                Write a letter
              </a>
              <span className="note">
                Free. No account. Nothing is stored on a server.
              </span>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="hero-env" id="heroEnv">
              <div className={`env rises ${isOpen ? 'open' : ''}`} data-face="back">
                <div className="env-stage">
                  <div className="env-flip">
                    {/* Front Face */}
                    <div className="env-face front">
                      <div className="ret">Arjun</div>
                      <div className="addr">
                        <small>To</small>Meera
                      </div>
                      <div
                        className="pm"
                        dangerouslySetInnerHTML={{
                          __html: renderPostmarkSvg('Pune', Date.now())
                        }}
                      />
                      <div
                        className="stp"
                        dangerouslySetInnerHTML={{
                          __html: renderPostageStampSvg(2)
                        }}
                      />
                      <i className="env-ring" />
                    </div>

                    {/* Back Face */}
                    <div className="env-face back">
                      <div className="env-lining" />
                      <div className="env-letter">
                        <div className="env-letter-in">
                          Dear Meera,
                          <br />
                          It rained all week, and I kept thinking of the terrace.
                          <br />
                          I saved three small things for you.
                          <br />
                          Write back soon.
                        </div>
                      </div>
                      <div className="env-pocket">
                        <div />
                      </div>
                      <div className="env-flap">
                        <div />
                      </div>
                      <button
                        className="env-seal"
                        type="button"
                        onClick={toggleHeroEnvelope}
                        aria-label="Break the wax seal"
                      >
                        <div className={`seal-wrap ${isOpen ? 'broken' : ''}`}>
                          <div
                            className="seal-half l"
                            dangerouslySetInnerHTML={{
                              __html: renderWaxSealSvg('oxblood', 'K')
                            }}
                          />
                          <div
                            className="seal-half r"
                            dangerouslySetInnerHTML={{
                              __html: renderWaxSealSvg('oxblood', 'K')
                            }}
                          />
                        </div>
                      </button>
                      <i className="env-ring" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="hero-hint">
              <button
                className="linkbtn"
                id="heroHint"
                type="button"
                onClick={toggleHeroEnvelope}
              >
                {isOpen ? 'Seal it again' : 'Tap the seal to open it'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
