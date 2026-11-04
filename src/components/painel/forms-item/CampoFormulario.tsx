import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

interface CampoBaseProps {
  id: string;
  label: string;
  error?: string;
  counter?: string;
  className?: string;
  containerClassName?: string;
}

type CampoFormularioProps = CampoBaseProps &
  (
    | {
        as?: "input";
        controlProps?: InputHTMLAttributes<HTMLInputElement>;
      }
    | {
        as: "textarea";
        controlProps?: TextareaHTMLAttributes<HTMLTextAreaElement>;
      }
    | {
        as: "select";
        children: ReactNode;
        controlProps?: SelectHTMLAttributes<HTMLSelectElement>;
      }
  );

function CampoFormulario(props: CampoFormularioProps) {
  const {
    id,
    label,
    error,
    counter,
    className = "",
    containerClassName = "",
  } = props;

  const controlProps = props.controlProps ?? {};
  const describedBy =
    [
      controlProps["aria-describedby"],
      error ? `${id}-erro` : undefined,
      !error && counter ? `${id}-contador` : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const classes = `form-control ${className} ${
    error ? "form-control-invalid" : ""
  }`;

  return (
    <div className={`form-field ${containerClassName}`}>
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      {props.as === "select" ? (
        <div className="form-select-wrap">
          <select
            id={id}
            {...(props.controlProps ?? {})}
            className={`${classes} form-select`}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
          >
            {props.children}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="form-select-arrow"
            fill="none"
          >
            <path
              d="m5 7.5 5 5 5-5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
            />
          </svg>
        </div>
      ) : props.as === "textarea" ? (
        <textarea
          id={id}
          {...(props.controlProps ?? {})}
          className={classes}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
      ) : (
        <input
          id={id}
          {...(props.controlProps ?? {})}
          className={classes}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
      )}
      {error && (
        <p id={`${id}-erro`} className="form-error" role="alert">
          {error}
        </p>
      )}
      {!error && counter && (
        <p id={`${id}-contador`} className="form-counter" aria-live="polite">
          {counter}
        </p>
      )}
    </div>
  );
}

export default CampoFormulario;
