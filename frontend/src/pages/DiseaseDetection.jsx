import { useState } from "react";

import {
  Camera,
  Upload,
  Search,
  CheckCircle,
  AlertTriangle,
  Leaf,
  ShieldCheck,
  RefreshCw
} from "lucide-react";

function DiseaseDetection() {

  const [image, setImage] = useState(null);

  const [preview, setPreview] = useState(null);

  const [analyzing, setAnalyzing] = useState(false);

  const [result, setResult] = useState(null);


  const handleImage = (file) => {

    if (!file) return;

    setImage(file);

    setPreview(URL.createObjectURL(file));

    setResult(null);
  };


  const handleFileChange = (e) => {

    const file = e.target.files[0];

    handleImage(file);
  };


  const analyzeImage = () => {

    if (!image) return;

    setAnalyzing(true);

    setTimeout(() => {

      setAnalyzing(false);

      setResult({
        disease: "Tomato Leaf Blight",
        confidence: "94%",
        severity: "Moderate",
        treatment:
          "Remove affected leaves and improve air circulation around the plants.",
        prevention:
          "Avoid overhead watering and maintain proper spacing between plants."
      });

    }, 1800);
  };


  const reset = () => {

    setImage(null);

    setPreview(null);

    setResult(null);
  };


  return (

    <div className="disease-page">


      {/* HERO */}

      <section className="disease-hero">

        <div>

          <div className="disease-badge">
            <ShieldCheck size={17} />
            AI Crop Health Scanner
          </div>

          <h1>
            Detect Crop Diseases
            <span> Early 🌿</span>
          </h1>

          <p>
            Upload a clear image of a crop leaf and SmartAgri AI
            will analyze it for possible diseases and provide
            recommended actions.
          </p>

        </div>


        <img
          src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=80"
          alt="Healthy crop plants"
          className="disease-hero-image"
        />

      </section>


      {/* CONTENT */}

      <section className="disease-layout">


        {/* UPLOAD CARD */}

        <div className="detection-card">

          <div className="detection-title">

            <div className="camera-icon">
              <Camera size={25} />
            </div>

            <div>

              <h2>Upload Crop Image</h2>

              <p>
                JPG, JPEG or PNG • Maximum 10 MB
              </p>

            </div>

          </div>


          {!preview ? (

            <label
              className="drop-zone"
              htmlFor="leaf-upload"
            >

              <div className="upload-circle">
                <Upload size={30} />
              </div>

              <h3>
                Drag & drop your leaf image
              </h3>

              <p>
                or click here to browse from your device
              </p>

              <span className="browse-button">
                Choose Image
              </span>

              <input
                id="leaf-upload"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                hidden
              />

            </label>

          ) : (

            <div className="image-preview-area">

              <img
                src={preview}
                alt="Uploaded crop"
                className="leaf-preview"
              />

              <div className="image-info">

                <Leaf size={18} />

                <span>
                  {image?.name}
                </span>

              </div>

              <button
                className="remove-image"
                onClick={reset}
              >
                <RefreshCw size={17} />
                Choose Another Image
              </button>

            </div>

          )}


          {/* ANALYZE BUTTON */}

          {preview && !result && (

            <button
              className="analyze-button"
              onClick={analyzeImage}
              disabled={analyzing}
            >

              {analyzing ? (

                <>
                  <Search className="spin" size={20} />
                  Analyzing Crop...
                </>

              ) : (

                <>
                  <Search size={20} />
                  Analyze Crop
                </>

              )}

            </button>

          )}


          {/* RESULT */}

          {result && (

            <div className="disease-result">

              <div className="result-header">

                <div className="result-success">
                  <CheckCircle size={24} />
                </div>

                <div>

                  <span>Analysis Complete</span>

                  <h2>
                    {result.disease}
                  </h2>

                </div>

                <div className="confidence">
                  {result.confidence}
                  <small>confidence</small>
                </div>

              </div>


              <div className="severity">

                <span>Severity</span>

                <strong>
                  {result.severity}
                </strong>

              </div>


              <div className="result-section">

                <div className="result-icon treatment">
                  💊
                </div>

                <div>

                  <h3>Recommended Treatment</h3>

                  <p>
                    {result.treatment}
                  </p>

                </div>

              </div>


              <div className="result-section">

                <div className="result-icon prevention">
                  🛡️
                </div>

                <div>

                  <h3>Prevention</h3>

                  <p>
                    {result.prevention}
                  </p>

                </div>

              </div>


              <button
                className="scan-again"
                onClick={reset}
              >
                Scan Another Crop
              </button>

            </div>

          )}

        </div>


        {/* RIGHT SIDE */}

        <div className="disease-sidebar">


          {/* How it works */}

          <div className="how-card">

            <h2>How it works</h2>

            <div className="how-step">

              <span>1</span>

              <div>
                <strong>Take a photo</strong>
                <p>
                  Capture a clear photo of the affected leaf.
                </p>
              </div>

            </div>


            <div className="how-step">

              <span>2</span>

              <div>
                <strong>Upload image</strong>
                <p>
                  Upload the crop image to SmartAgri AI.
                </p>
              </div>

            </div>


            <div className="how-step">

              <span>3</span>

              <div>
                <strong>AI analysis</strong>
                <p>
                  The system checks the visual symptoms.
                </p>
              </div>

            </div>


            <div className="how-step">

              <span>4</span>

              <div>
                <strong>Get recommendations</strong>
                <p>
                  Receive possible treatment and prevention tips.
                </p>
              </div>

            </div>

          </div>


          {/* Warning */}

          <div className="warning-card">

            <AlertTriangle size={22} />

            <div>

              <strong>Important</strong>

              <p>
                AI results are informational. For serious
                crop damage, consult a qualified agricultural
                expert before applying pesticides or treatments.
              </p>

            </div>

          </div>


          {/* Photo */}

          <div className="crop-photo-card">

            <img
              src="https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=700&q=80"
              alt="Healthy vegetable crop"
            />

            <div>
              <h3>Keep Your Crops Healthy 🌱</h3>

              <p>
                Early identification can help farmers
                respond to crop problems sooner.
              </p>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default DiseaseDetection;