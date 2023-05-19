import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Modal, Button, Form, Table} from 'react-bootstrap';

const URL = 'http://20.231.202.18:8000/api/form';

const App = () => {
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedForm, setSelectedForm] = useState(null);
  const [formData, setFormData] = useState({ code: '', name: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({ code: '', name: '', description: '' });

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredForms(forms);
    } else {
      const filtered = forms.filter(
        (form) =>
          form.code.toString().includes(searchTerm) ||
          form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          form.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredForms(filtered);
    }
  }, [searchTerm, forms]);

  const fetchForms = async () => {
    try {
      const response = await fetch(URL);
      const data = await response.json();
      setForms(data);
      setFilteredForms(data);
    } catch (error) {
      console.log(error);
    }
  };

  const addForm = async () => {
    try {
      const response = await fetch(URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setForms([...forms, data]);
      setFilteredForms([...forms, data]);
      setModalOpen(false);
      setFormData({ code: '', name: '', description: '' });
      setErrors({ code: '', name: '', description: '' });
    } catch (error) {
      console.log(error);
    }
  };

  const updateForm = async () => {
    try {
      const response = await fetch(`${URL}/${selectedForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      const updatedForms = forms.map((form) => (form.id === selectedForm.id ? data : form));
      setForms(updatedForms);
      setFilteredForms(updatedForms);
      setModalOpen(false);
      setFormData({ code: '', name: '', description: '' });
      setSelectedForm(null);
      setErrors({ code: '', name: '', description: '' });
    } catch (error) {
      console.log(error);
    }
  };

  const deleteForm = async (id) => {
    try {
      await fetch(`${URL}/${id}`, {
        method: 'DELETE',
      });
      const filteredForms = forms.filter((form) => form.id !== id);
      setForms(filteredForms);
      setFilteredForms(filteredForms);
      setModalOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const openAddModal = () => {
    setModalOpen(true);
    setModalMode('add');
  };

  const openEditModal = (form) => {
    setModalOpen(true);
    setModalMode('edit');
    setSelectedForm(form);
    setFormData({ code: form.code, name: form.name, description: form.description });
    setErrors({ code: '', name: '', description: '' });
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMode('add');
    setSelectedForm(null);
    setFormData({ code: '', name: '', description: '' });
    setErrors({ code: '', name: '', description: '' });
  };


  const validateForm = () => {
    let valid = true;
    const newErrors = { code: '', name: '', description: '' , state: ''};

    if (formData.code.trim() === '') {
      newErrors.code = 'El código es requerido.';
      valid = false;
    }

    if (formData.code.trim().length > 5) {
      newErrors.code = 'El código debe tener un máximo 5 caracteres.';
      valid = false;
    }

    if (formData.name.trim() === '') {
      newErrors.name = 'El nombre es requerido.';
      valid = false;
    }

    if (formData.description.trim() === '') {
      newErrors.description = 'La descripción es requerida.';
      valid = false;
    }

    if (valid){
      newErrors.state = 'Operación realizada con éxito.';
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      if (modalMode === 'add') {
        addForm();
      } else {
        updateForm();
      }
    }
  };

  return (
    <div className="container">
      <h1>Lista de productos</h1>
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <Button variant="primary" onClick={openAddModal}>
            Agregar form
          </Button>
        </div>
        <div className="mt-3">
          <input
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>


      <div className="mt-3">
        {modalOpen && (
          <Modal show={modalOpen} onHide={closeModal}>
            <Modal.Header closeButton>
              <Modal.Title>{modalMode === 'add' ? 'Agregar Form' : 'Editar Form'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group>
                  <Form.Label>Code:</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                  {errors.code && <div className="text-danger">{errors.code}</div>}
                </Form.Group>
                <Form.Group>
                  <Form.Label>Name:</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  {errors.name && <div className="text-danger">{errors.name}</div>}
                </Form.Group>
                <Form.Group>
                  <Form.Label>Description:</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                  {errors.description && <div className="text-danger">{errors.description}</div>}
                </Form.Group>
                {errors.state && <div className="text-success">{errors.state}</div>}
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={closeModal}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSubmit}>
                {modalMode === 'add' ? 'Agregar' : 'Guardar'}
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>

      <Table striped bordered>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Description</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredForms.map((form) => (
            <tr key={form.id}>
              <td>{form.code}</td>
              <td>{form.name}</td>
              <td>{form.description}</td>
              <td>
                <Button variant="warning" onClick={() => openEditModal(form)}>
                  Editar
                </Button>{' '}
                <Button variant="danger" onClick={() => deleteForm(form.id)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default App;
