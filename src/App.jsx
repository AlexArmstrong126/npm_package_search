import { useState } from "react";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    package: "",
    version: "",
    generateDependenciesLicense: false,
    generatePackageLicense: false,
    generateDependenciesList: false,
  });
  const [npmData, setNpmData] = useState();
  const [packageLicense, setPackageLicense] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("generate")) {
      const { checked } = e.target;
      setFormData((prevState) => ({
        ...prevState,
        [name]: checked,
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    console.log("Copied text");
  };

  const fetchData = async () => {
    setIsLoading(true);
    const endpoint = `https://registry.npmjs.org/${formData.package}/${formData.version}`;
    const res = await fetch(endpoint);
    const data = await res.json();
    console.log(data);
    setNpmData(data);
    fetchOptions(formData, data);
    setIsLoading(false);
  };

  const fetchPackageLicense = (data) => {
    const { url } = data.repository;
    if (data) {
      const repoUrl = url;
      const owner = repoUrl.match(/github\.com\/([^/]+)\//);
      const ownerName = owner ? owner[1] : null;
      console.log(ownerName);

      fetch(
        `https://api.github.com/repos/${ownerName}/${formData.package}/license`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((licenseData) => {
          // Decode Base64 content
          const licenseContent = atob(licenseData.content);
          setPackageLicense(licenseContent);
          console.log("license", licenseContent);
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        });
    }
  };
  const fetchOptions = async (
    {
      generateDependenciesLicense,
      generatePackageLicense,
      generateDependenciesList,
    },
    data
  ) => {
    if (generatePackageLicense) {
      fetchPackageLicense(data);
    }
    // console.log(
    //   generateDependenciesLicense,
    //   generatePackageLicense,
    //   generateDependenciesList
    // );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();

    console.log("Form submitted with data:", formData);
    // You can perform any further actions here, such as sending the data to a server
  };

  const generateDependencies = (dependenciesObj) => {
    let dependencyArray = [];
    Object.keys(dependenciesObj).forEach((key) => {
      dependencyArray.push(`${key}: ${dependenciesObj[key]}`);
    });
    return dependencyArray;
  };

  const generatePackageTemplate = (packageData) => {
    const { name, license, repository, dependencies } = packageData;
    generateDependencies(dependencies);
    return (
      <>
        {/* <h1>Name: {name}</h1>
        <p>Licence {license}</p>
        <h3>Dependencies</h3> */}
        {/* <ul>
          {generateDependencies(dependencies).map((deps) => {
            return <li key={deps}>{deps}</li>;
          })}
        </ul> */}
        {/* 
        <p>{repository.url}</p> */}
      </>
    );
  };

  return (
    <>
      <h1>Npm Dev Dependencies and licences</h1>
      <div className="form__container">
        <form className="form__container" onSubmit={handleSubmit}>
          <label htmlFor="dependencies">Package</label>
          <input
            required
            type="text"
            name="package"
            onChange={handleChange}
            value={formData.package}
          />
          <label htmlFor="version">Version</label>
          <input
            required
            type="text"
            name="version"
            onChange={handleChange}
            value={formData.version}
          />
          <div className="form__options">
            <label htmlFor="generateDependencyLicense">
              Generate Dependecy licences
            </label>
            <input
              type="checkbox"
              id="generateDependency"
              name="generateDependenciesLicense"
              onClick={handleChange}
              value={formData.generateDependenciesLicense}
            />
            <label htmlFor="generatePackageLicence">
              Generate Package licences
            </label>
            <input
              type="checkbox"
              id="generatePackageLicence"
              name="generatePackageLicense"
              onClick={handleChange}
              value={formData.generatePackageLicense}
            />
            <label htmlFor="generateDependencyList">
              Generate Dependecy list
            </label>
            <input
              type="checkbox"
              id="generateDependencyList"
              name="generateDependenciesList"
              onClick={handleChange}
              value={formData.generateDependenciesList}
            />
          </div>

          <button type="submit">Submit</button>
        </form>
        {isLoading ? (
          <h1>loading...</h1>
        ) : (
          // npmData && generatePackageTemplate(npmData)
          npmData && <h1>loaded</h1>
        )}
        {isLoading && formData.generatePackageLicense ? (
          <h1>loading...</h1>
        ) : (
          // npmData && generatePackageTemplate(npmData)
          packageLicense && (
            <>
              <p>{packageLicense}</p>
              <button
                onClick={() => {
                  copyText(packageLicense);
                }}
              >
                copy
              </button>
            </>
          )
        )}
      </div>
    </>
  );
}

export default App;
