import { useState } from "react";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    package: "",
    version: "",
  });

  const [npmData, setNpmData] = useState();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const fetchData = async () => {
    const endpoint = `http://registry.npmjs.com/${formData.package}/${formData.version}`;
    const res = await fetch(endpoint);
    const data = await res.json();
    console.log(data);
    setNpmData(data);
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
        <h1>{name}</h1>
        <p>{license}</p>
        {generateDependencies(dependencies).map((deps) => {
          return <p>{deps}</p>;
        })}
        <p>{repository.url}</p>
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
          <button type="submit">Submit</button>
        </form>
        {npmData && generatePackageTemplate(npmData)}
      </div>
    </>
  );
}

export default App;
