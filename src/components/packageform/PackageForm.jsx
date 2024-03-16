import React, { useState } from 'react';
import './styles.css';
import Accordion from '../accordion/Accordion';
const PackageForm = () => {
  const [formData, setFormData] = useState({
    package: '',
    version: '',
    generateDependenciesLicense: false,
    generatePackageLicense: false,
    generateDependenciesList: false,
  });
  const [npmData, setNpmData] = useState();
  const [packageLicense, setPackageLicense] = useState('');
  const [dependencyList, setDependencyList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name.includes('generate')) {
      const { checked } = e.target;
      setFormData(prevState => ({
        ...prevState,
        [name]: checked,
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const copyText = (text, name) => {
    navigator.clipboard.writeText(text);
    alert(`Copied text for ${name}`);
    console.log('Copied text');
  };

  const fetchData = async () => {
    setIsLoading(true);
    const endpoint = `https://registry.npmjs.org/${formData.package}/${formData.version}`;

    try {
      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await res.json();
      console.log(data);
      setNpmData(data);
      fetchOptions(formData, data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    setIsLoading(false);
  };

  const fetchPackageLicense = data => {
    if (data) {
      const { url } = data.repository;
      const repoUrl = url;
      const owner = repoUrl.match(/github\.com\/([^/]+)\//);
      const ownerName = owner ? owner[1] : null;

      fetch(
        `https://api.github.com/repos/${ownerName}/${formData.package}/license`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
          },
        }
      )
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(licenseData => {
          // Decode Base64 content
          const licenseContent = atob(licenseData.content);
          setPackageLicense(licenseContent);
          console.log('license', licenseContent);
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
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
    if (generateDependenciesList) {
      generateDependencies(data);
    }
  };

  const clearState = () => {
    setDependencyList([]);
    setPackageLicense('');
  };

  const handleSubmit = e => {
    e.preventDefault();
    clearState();
    fetchData();

    console.log('Form submitted with data:', formData);
    // You can perform any further actions here, such as sending the data to a server
  };

  const generateDependencies = dependenciesObj => {
    console.log(dependenciesObj);
    let dependencyArray = [];
    Object.keys(dependenciesObj.dependencies).forEach(key => {
      dependencyArray.push(`${key}: ${dependenciesObj.dependencies[key]}`);
    });
    setDependencyList(dependencyArray);
  };

  const generatePackageTemplate = packageData => {
    const { name, license, repository } = packageData;
    console.log(packageData);
    return (
      <>
        <h1>{name} Package Information</h1>
        <div className='info__package'>
          <p>Name: {name}</p>
          <p>Licence: {license}</p>
          <p> Url {repository.url}</p>
        </div>
      </>
    );
  };
  return (
    <>
      <div className='form__container'>
        <h1>Npm Dev Dependencies and licences</h1>
        <form className='form__container' onSubmit={handleSubmit}>
          <label htmlFor='dependencies'>Package</label>
          <input
            required
            type='text'
            name='package'
            onChange={handleChange}
            value={formData.package}
          />
          <label htmlFor='version'>Version</label>
          <input
            required
            type='text'
            name='version'
            onChange={handleChange}
            value={formData.version}
          />
          <div className='form__options'>
            <label htmlFor='generateDependencyLicense'>
              Generate Dependecy licences
            </label>
            <input
              type='checkbox'
              id='generateDependency'
              name='generateDependenciesLicense'
              onClick={handleChange}
              value={formData.generateDependenciesLicense}
            />
            <label htmlFor='generatePackageLicence'>
              Generate Package licences
            </label>
            <input
              type='checkbox'
              id='generatePackageLicence'
              name='generatePackageLicense'
              onClick={handleChange}
              value={formData.generatePackageLicense}
            />
            <label htmlFor='generateDependencyList'>
              Generate Dependecy list
            </label>
            <input
              type='checkbox'
              id='generateDependencyList'
              name='generateDependenciesList'
              onClick={handleChange}
              value={formData.generateDependenciesList}
            />
          </div>

          <button type='submit' className='submitBtn'>
            Submit
          </button>
        </form>
      </div>
      {isLoading ? (
        <h1>loading...</h1>
      ) : (
        <>
          <div className='info__package'>
            {npmData && generatePackageTemplate(npmData)}
          </div>
          {dependencyList.length > 0 ||
            (packageLicense && (
              <div className='additonalInfoContainer'>
                <h1>Additional Information</h1>
                <div className='additonalInfoContainer__content'>
                  {/* {npmData?.devDependencies &&
              generateDependencies(npmData.devDependencies)} */}
                  {/* {dependencyList.length > 0 && (
            <div className="info__dependencies">
              {dependencyList.map((dep) => {
                return <p>{dep}</p>;
              })}
            </div>
          )} */}
                  {dependencyList.length > 0 && (
                    <div className='devDependencies'>
                      <h3>Package Dev Dependencies</h3>
                      <button
                        className='copy__btn'
                        onClick={() => {
                          copyText(
                            JSON.stringify(npmData.dependencies, undefined, 2)
                          );
                        }}
                      >
                        copy
                      </button>
                      <div className='info__devDependencies'>
                        {dependencyList.map(dep => {
                          return <p>{dep}</p>;
                        })}
                      </div>
                    </div>
                  )}
                  {packageLicense && (
                    <>
                      <div className='info__packageLicense'>
                        <Accordion
                          title={
                            <>
                              <h1>{npmData.name} Package License - </h1>
                              <button
                                className='copy__btn'
                                onClick={() => {
                                  copyText(packageLicense, npmData.name);
                                }}
                              >
                                COPY
                              </button>
                            </>
                          }
                          content={packageLicense}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
        </>
      )}
    </>
  );
};

export default PackageForm;
