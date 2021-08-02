import './App.css';
import logo from "./assets/logo3.png";
import axios from 'axios';
import 'materialize-css';
import React, {Fragment, useState} from 'react';
import {Form, Field, withFormik, FastField} from "formik";
import * as Yup from "yup";
import Result from "./components/Result";
import {Loader} from "./components/Loader";
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {
  IconFlagRU,
  IconFlagUS
} from 'material-ui-flags';
import ReCAPTCHA from "react-google-recaptcha";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1)
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  input: {
    paddingLeft: '12px!important',
    boxSizing: 'inherit!important',
    border: '1px solid #ddd!important',
    backgroundColor: '#E9E9E9FF!important',
    color: '#000!important',
    '&::placeholder': {
      color: '#000'
    }
  },
  inputGroup: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  oam: {
    width: "24%!important",
    cursor: "not-allowed!important",
    paddingLeft: '12px!important',
    '@media(max-width: 780px)' : {
      paddingLeft: '5px!important'
    },
    '@media(max-width: 420px)' : {
      paddingLeft: '0px!important',
      fontSize: '12px!important'
    },
    '&::placeholder': {
      color: '#c2c2c2!important'
    }
  },
  postfix: {
    width: "24%!important",
    '@media(max-width: 420px)' : {
      paddingLeft: '5px!important',
      fontSize: '12px!important'
    }
  },
  mainCodeWrapper: {
    position: 'relative'
  }
}));

function App(props){
  const classes = useStyles();
  const {touched, errors, setFieldValue} = props;

  let [lang, setLang] = useState('eng');
  const resultProps = {...props.props, lang};

  function onChange(value) {
    setFieldValue("recaptcha", value)
  }

  function langHandler(event) {
    setLang(event.target.value)
  }
    return (
        <div className="App container">
          <div className="wrapper">
              <Fragment>
                <div className="description">

                  <h1><img src={logo} alt="" className="logo"/>{lang === 'eng' ?
                      <span>Check the status of your application</span>
                      : <span>Проверьте статус вашей заявки</span>}</h1>
                  {lang === 'eng' ?
                      <div className='paragraphDescription'>
                        <p>
                          We all know how exhausting it can be to wait for a visa decision.
                          In order to ease the waiting time, I created this small service.
                          At first for myself, but then I decided that it could be useful to others.&#129505;
                        </p>

                        <p>
                          This service checks the list of applications on the official website
                          of the Ministry of the Interior of the Czech Republic several times a day and
                          will immediately notify you by email if your application is considered.
                        </p>
                      </div> :
                      <div className='paragraphDescription'>
                        <p>
                          Мы все знаем, как утомительно может быть ждать решения о выдаче визы.
                          Чтобы сократить время ожидания, я создал эту небольшую услугу.
                          Сначала для себя, но потом я решил, что это может быть полезно другим.&#129505;
                        </p>

                        <p>
                          Этот сервис проверяет список заявок на официальном сайте
                          министерства внутренних дел Чешской Республики несколько раз в день и
                          немедленно уведомит вас по электронной почте, если ваше заявление будет рассмотрено.
                        </p>
                      </div>}
                </div>
              </Fragment>
            <Form action="/create" >
              <div>                {
                  props.props.status !== 'initial' ? <Result {...resultProps}/> : null
                }
              </div>
              <div className="field">
                <div className="control">
                  <label className="label">{lang === 'eng' ? 'Code of request' : 'Код заявки'}</label>
                  <div className={classes.inputGroup}>
                    <Field className={`${classes.input} ${classes.oam}`}
                           type="text"
                           name="oam"
                           placeholder="OAM" disabled/>
                    <span className={classes.mainCodeWrapper}>
                      <Field className={`${classes.input} ${classes.mainCode}` }
                             type="text"
                             name="code"
                             placeholder={lang === 'eng' ? 'Code' : 'Код'} disabled={props.props.isLoading}/>
                      {touched.code && errors.code &&
                      <label className="error errorCode">
                        {
                          errors.code === 'Code is required' ? (lang === 'rus' ? 'Код обязателен': 'Code is required'):
                              (lang === 'rus' ? 'Код должен быть максимум 10 символов': 'Code cannot be longer than 10')
                        }
                      </label>}
                    </span>
                    <Field className={`${classes.input} ${classes.postfix}`}
                           type="text"
                           name="postfix"
                           placeholder="-xx"/>
                  </div>

                </div>
              </div>
              <div className="field">
                <div className="control">
                  <label className="label">{lang === 'eng' ? 'Type' : 'Тип'}</label>
                  <Field className={classes.input} as="select" name="type" disabled={props.props.isLoading}>
                    <option value="" hidden disabled>{lang === 'eng' ?
                        'Choose here'
                        : 'Выбрать'}</option>
                    <option value="DP">DP</option>
                    <option value="DV">DV</option>
                    <option value="PP">PP</option>
                    <option value="ZK">ZK</option>
                    <option value="ZM">ZM</option>
                    <option value="ST">ST</option>
                    <option value="TP">TP</option>
                    <option value="CD">CD</option>
                    <option value="VP">VP</option>
                    <option value="MK">MK</option>
                  </Field>
                  {touched.type && errors.type && <label className="error">
                    {
                      (errors.type === 'Type is required' && lang === 'rus') ? 'Тип обязателен' : 'Type is required'
                    }
                  </label>}

                </div>
              </div>
              <div className="field">
                <div className="control">
                  <label className="label">{lang === 'eng' ? 'Year' : 'Год'}</label>
                  <Field className={classes.input}
                         as="select"
                         name="year"
                         disabled={props.props.isLoading}>
                    <option value="" disabled hidden>{lang === 'eng' ?
                        'Choose here'
                        : 'Выбрать'}</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                    <option value="2019">2019</option>
                  </Field>
                  {touched.year && errors.year && <label className="error">
                    {
                      (errors.year === 'Year is required' && lang === 'rus') ? 'Год обязателен' : 'Year is required'
                    }
                  </label>}
                </div>
              </div>
              <div className="field">
                <div className="control">
                  <label className="label">{lang === 'eng' ? 'Email for a notification' : 'Email адрес для уведомления'}</label>
                  <Field className={classes.input}
                         type="email"
                         name="email"
                         placeholder="Email"
                         disabled={props.props.isLoading}/>
                  {touched.email && errors.email && <label className="error">
                    {
                      errors.email === 'Email is required' ? (lang === 'rus' ? 'Почта обязательна': 'Email is required'):
                          (lang === 'rus' ? 'Код должен быть максимум 10 символов': 'Code cannot be longer than 10')
                          && errors.email === 'Email not valid' && lang === 'rus' ? 'Email некорректный': 'Email not valid'
                    }
                  </label>}
                </div>
              </div>
              <div className="recaptchaWrapper">
                <FastField
                    className="field recaptcha"
                    sitekey='6LcL6rIbAAAAADYvPlQV-l8hH3zf6h9B8103wGT2'
                    component={ReCAPTCHA}
                    size="invisible"

                    name="recaptcha"
                    onChange={onChange}>
                  {touched.recaptcha && errors.recaptcha &&
                  <label className="error recaptchaError">
                    {
                      lang !== 'rus' ? "Robots are not welcome yet!" : "Поставьте галочку, если Вы не робот"
                    }
                  </label>}
                </FastField>
              </div>

              <button className="btn waves-effect light-blue darken-1"
                      type="submit"
                      name="action"
                      disabled={props.props.isLoading}>{lang === 'eng' ? 'Check' : 'Проверить'}
                <i className="material-icons right"></i>
              </button>
              {
                props.props.isLoading ? <Loader /> : null
              }
            </Form>
          </div>

          <div className="selectLang">
            <FormControl className={classes.formControl}>
              <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={lang}
                  onChange={langHandler}
                  MenuProps={{
                    disableScrollLock: true,
                  }}
              >
                <MenuItem value={"rus"}><IconFlagRU /></MenuItem>
                <MenuItem value={"eng"}><IconFlagUS /></MenuItem>
              </Select>
            </FormControl>
          </div>

        </div>
    )
}

const FormikApp = withFormik({
  enableReinitialize: true,
  mapPropsToValues({ email, code, year, type, status, recaptcha }) {
    return {
      code: code || '',
      type: type || '',
      year: year || '',
      email: email || '',
      status: status || '',
      recaptcha: recaptcha || '',
      success: false
    }
  },
  validationSchema: Yup.object().shape({
    email: Yup.string().max(39, 'Email is too long').email('Email not valid').required('Email is required'),
    code: Yup.string().max(9, 'Code cannot be longer than 10').required('Code is required'),
    type: Yup.string().required('Type is required'),
    year: Yup.string().required('Year is required')
  }),
  handleSubmit(values, { props, resetForm, setSubmitting , setFieldValue }) {
    setSubmitting(true);
    props.isFetching(true);
    setTimeout(() => {
      let {code, type, year, email, recaptcha} = values;
      const userDataFront = {
        code,
        type,
        year,
        email,
        recaptcha
      }
      axios
          .post('https://czvisas.herokuapp.com/create', userDataFront)
          .then(
              (response) => {
                props.getres(response.data);
                props.isFetching(false);
                resetForm();
                window.grecaptcha.reset();
              }
          )
          .catch(err => {
            console.error(err);
          });

      setSubmitting(false)
      setFieldValue("success", true);
    }, 200)
  }
})(App)

export default FormikApp;
