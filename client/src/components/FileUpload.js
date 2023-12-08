import React, { Fragment, useState } from 'react';
import axios from 'axios';

const FileUpload = () => {

  // Date
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Code Societé
  const [codeSoc, setCodeSoc] = useState('');

  // currency
  const [currency, setCurrency] = useState('');

  // socFile
  const [socFile, setSocFile] = useState('');
  const [socFileName, setSocFileName] = useState('Pivot société');

  // pivotFile
  const [pivotFile, setPivotFile] = useState('');
  const [pivotFileName, setPivotFileName] = useState('Pivot modèle');

  const [links, setLinks] = useState([]);

  const onCodeChange = e => setCodeSoc(e.target.value);

  const onSocChange = e => {
    setSocFile(e.target.files[0]);
    setSocFileName(e.target.files[0].name);
  };

  const onPivotChange = e => {
    setPivotFile(e.target.files[0]);
    setPivotFileName(e.target.files[0].name);
  };

  const onSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.set('codeSoc', codeSoc);
    formData.set('date', date);
    formData.set('currency', currency);
    formData.append('socFile', socFile);
    formData.append('pivotFile', pivotFile);

    try {
      const res = await axios.post('/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(res.data);
      setLinks(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Fragment>
      <form onSubmit={onSubmit}>
        <div className="form-group mb-4">
          <label>Code</label>
          <input type="text" className='form-control' value={codeSoc} onChange={e => onCodeChange(e)}/> 
        </div>
        <div className="form-group mb-4">
          <label>Devise</label>
          <input type="text" className='form-control' value={currency} onChange={e => setCurrency(e.target.value)}/> 
        </div>
        <div className="form-group mb-4">
          <label>Date</label>
          <input type="date" className='form-control' value={date} onChange={e => setDate(e.target.value)}/>
        </div>
        <div className="custom-file mb-4">
          <input
            type='file'
            className='custom-file-input'
            id='socFile'
            onChange={onSocChange}
          />
          <label className='custom-file-label' htmlFor='customFile'>
            {socFileName}
          </label>
        </div>

        <div className='custom-file mb-4'>
          <input
            type='file'
            className='custom-file-input'
            id='pivotFile'
            onChange={onPivotChange}
          />
          <label className='custom-file-label' htmlFor='customFile'>
            {pivotFileName}
          </label>
        </div>

        <input
          type='submit'
          value='Générer'
          className='btn btn-primary btn-block mt-4'
        />
      </form>
      <ul className="list-group mt-4">
        {links.map(link => 
          <li key={link} className="list-group-item">
            <a rel="noopener noreferrer" target="_blank" href={`localhost:5000/process?fileName=${link}`} download>
              ESPF{link.replace(/^\d+/, '')}
            </a>
          </li>)}
    </ul>
    </Fragment>
  );
};

export default FileUpload;